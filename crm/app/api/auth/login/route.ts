import { NextRequest, NextResponse } from "next/server";
import { adminUser, checkPassword, isAdminEmail } from "@/lib/credentials";
import { startChallenge } from "@/lib/otp";
import { isMailConfigured, sendOtpCode } from "@/lib/mailer";
import { createOtpToken, OTP_COOKIE, OTP_TTL_MS, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Attempt = { count: number; resetAt: number };
const limiter = globalThis as { __crmLoginAttempts?: Map<string, Attempt> };
const attempts = (limiter.__crmLoginAttempts ??= new Map<string, Attempt>());

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;

function rateLimited(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < Date.now()) {
    attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export async function POST(request: NextRequest) {
  let payload: { email?: unknown; password?: unknown };
  try {
    payload = (await request.json()) as { email?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");
  const admin = adminUser();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}:${email || "anonymous"}`;

  if (rateLimited(key)) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 }
    );
  }

  if (!email || !password || !isAdminEmail(email) || !checkPassword(password)) {
    recordFailure(key);
    return NextResponse.json(
      { ok: false, error: "Identifiants incorrects ou adresse non autorisée." },
      { status: 401 }
    );
  }

  attempts.delete(key);

  const { id, code } = startChallenge(email, admin.name);

  let delivered = false;
  let devCode: string | undefined;
  let smtpFailed = false;
  try {
    const result = await sendOtpCode({ to: email, code, name: admin.name });
    delivered = result.delivered;
    devCode = result.devCode;
  } catch (error) {
    console.error("OTP delivery failed:", error);
    smtpFailed = true;
    // Once AUTH_SHOW_DEV_OTP=false (production) a broken relay must fail the
    // sign-in instead of exposing the code. While it is still true, fall back
    // to the on-screen code so a bad SMTP password cannot lock the admin out.
    if (process.env.AUTH_SHOW_DEV_OTP === "false") {
      return NextResponse.json(
        { ok: false, error: "Impossible d'envoyer l'e-mail de vérification." },
        { status: 502 }
      );
    }
    devCode = code;
  }

  const response = NextResponse.json({
    ok: true,
    email,
    delivered,
    devMode: !isMailConfigured() || smtpFailed,
    devCode,
    expiresInSeconds: Math.round(OTP_TTL_MS / 1000),
  });

  response.cookies.set(OTP_COOKIE, await createOtpToken(id, email), {
    ...sessionCookieOptions(Math.round(OTP_TTL_MS / 1000)),
  });

  return response;
}
