import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const N = 32768, R = 8, P = 1, KEYLEN = 64;
const opts = { N, r: R, p: P, maxmem: 128 * 1024 * 1024 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, opts);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[4], "base64");
  const expected = Buffer.from(parts[5], "base64");
  const actual = scryptSync(password, salt, expected.length, {
    N: Number(parts[1]), r: Number(parts[2]), p: Number(parts[3]), maxmem: 128 * 1024 * 1024,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Used to keep login timing similar when the email does not exist.
export const DUMMY_HASH = hashPassword("dummy-password-for-timing");
