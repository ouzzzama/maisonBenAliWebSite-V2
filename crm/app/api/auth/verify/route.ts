import { NextRequest, NextResponse } from "next/server";
import { checkCode } from "@/lib/otp";
import {
  createSessionToken,
  OTP_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  sessionCookieOptions,
  verifyOtpToken,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  expired: "Code expiré. Demandez un nouveau code.",
  invalid: "Code incorrect.",
  locked: "Trop de tentatives sur ce code. Demandez un nouveau code.",
};

export async function POST(request: NextRequest) {
  let payload: { code?: unknown };
  try {
    payload = (await request.json()) as { code?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }

  const code = String(payload.code ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: "Saisissez les 6 chiffres du code." }, { status: 400 });
  }

  const challengeToken = request.cookies.get(OTP_COOKIE)?.value;
  const challenge = await verifyOtpToken(challengeToken);
  if (!challenge) {
    return NextResponse.json(
      { ok: false, error: "Session de vérification expirée. Reconnectez-vous." },
      { status: 401 }
    );
  }

  const result = checkCode(challenge.id, code);
  if (!result.ok) {
    const response = NextResponse.json(
      { ok: false, error: MESSAGES[result.reason] },
      { status: result.reason === "invalid" ? 401 : 410 }
    );
    if (result.reason !== "invalid") response.cookies.delete(OTP_COOKIE);
    return response;
  }

  const response = NextResponse.json({ ok: true, email: result.email, name: result.name });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(result.email, result.name), {
    ...sessionCookieOptions(Math.round(SESSION_TTL_MS / 1000)),
  });
  response.cookies.delete(OTP_COOKIE);
  return response;
}
