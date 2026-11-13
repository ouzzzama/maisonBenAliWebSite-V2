import { createHash, timingSafeEqual } from "node:crypto";

/** Single-admin credentials, configurable through the environment. */
export function adminUser(): { email: string; name: string } {
  return {
    email: (process.env.ADMIN_EMAIL || "contact@maisonbenali.com").trim().toLowerCase(),
    name: process.env.ADMIN_NAME || "Fouad Benali",
  };
}

export function checkPassword(password: string): boolean {
  // No fallback: an unset ADMIN_PASSWORD locks the sign-in instead of opening
  // it with a well-known password.
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const given = createHash("sha256").update(password ?? "").digest();
  const wanted = createHash("sha256").update(expected).digest();
  return timingSafeEqual(given, wanted);
}

/** Only the configured admin address can request a code. */
export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === adminUser().email;
}
