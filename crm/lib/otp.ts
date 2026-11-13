import { createHash, randomInt, randomUUID } from "node:crypto";
import { OTP_TTL_MS } from "./session";

type Challenge = {
  id: string;
  email: string;
  name: string;
  hash: string;
  expiresAt: number;
  attempts: number;
};

const cache = globalThis as { __crmOtpChallenges?: Map<string, Challenge> };
const challenges = (cache.__crmOtpChallenges ??= new Map<string, Challenge>());

const hashCode = (code: string) => createHash("sha256").update(code.trim()).digest("hex");

export function startChallenge(email: string, name: string): { id: string; code: string } {
  const id = randomUUID();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  challenges.set(id, {
    id,
    email,
    name,
    hash: hashCode(code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return { id, code };
}

export type CodeResult =
  | { ok: true; email: string; name: string }
  | { ok: false; reason: "expired" | "invalid" | "locked" };

export function checkCode(id: string, code: string): CodeResult {
  const challenge = challenges.get(id);
  if (!challenge) return { ok: false, reason: "expired" };

  if (challenge.expiresAt < Date.now()) {
    challenges.delete(id);
    return { ok: false, reason: "expired" };
  }

  challenge.attempts += 1;
  if (challenge.attempts > 5) {
    challenges.delete(id);
    return { ok: false, reason: "locked" };
  }

  if (hashCode(code) !== challenge.hash) return { ok: false, reason: "invalid" };

  challenges.delete(id);
  return { ok: true, email: challenge.email, name: challenge.name };
}
