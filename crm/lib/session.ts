/**
 * Signed-token helpers shared by the middleware (edge) and the Node routes.
 * Uses Web Crypto only, so `btoa`/`atob`/`crypto.subtle` work in both runtimes.
 */

export const SESSION_COOKIE = "crm_session";
export const OTP_COOKIE = "crm_otp";

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 h
export const OTP_TTL_MS = 10 * 60 * 1000; // 10 min

export type SessionUser = { email: string; name: string; exp: number };
export type OtpToken = { id: string; email: string; exp: number };

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (value) return value;
  // The dev fallback must never sign real sessions: a public secret would let
  // anyone forge a session cookie.
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET manquant : définissez-le avant de démarrer le CRM");
  }
  return "maison-benali-crm-dev-secret-change-me";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function readToken<T extends { exp: number }>(token?: string): Promise<T | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(),
    fromBase64Url(signature),
    encoder.encode(body)
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as T;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(email: string, name: string): Promise<string> {
  return signToken({ email, name, exp: Date.now() + SESSION_TTL_MS });
}

export function verifySessionToken(token?: string): Promise<SessionUser | null> {
  return readToken<SessionUser>(token);
}

export function createOtpToken(id: string, email: string): Promise<string> {
  return signToken({ id, email, exp: Date.now() + OTP_TTL_MS });
}

export function verifyOtpToken(token?: string): Promise<OtpToken | null> {
  return readToken<OtpToken>(token);
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.AUTH_COOKIE_SECURE === "true",
  };
}
