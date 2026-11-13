import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from "./session";

/** Reads and verifies the CRM session cookie (server components / route handlers). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function getSessionUser(): Promise<{ email: string; name: string } | null> {
  const session = await getSession();
  return session ? { email: session.email, name: session.name } : null;
}
