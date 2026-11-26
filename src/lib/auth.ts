import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { config } from "./config";
import { getDb } from "./db";

const COOKIE = "tt_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface Admin { id: number; email: string }

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export function createSession(adminId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + TTL_MS);
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString());
  db.prepare("INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)").run(sha(token), adminId, expires.toISOString());
  cookies().set(COOKIE, token, {
    httpOnly: true, sameSite: "strict", secure: config.cookieSecure, path: "/", expires,
  });
}

export function getAdmin(): Admin | null {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT a.id, a.email FROM sessions s JOIN admins a ON a.id = s.admin_id
       WHERE s.id = ? AND s.expires_at > ?`,
    )
    .get(sha(token), new Date().toISOString()) as Admin | undefined;
  return row ?? null;
}

export function destroySession() {
  const token = cookies().get(COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sha(token));
  cookies().set(COOKIE, "", { httpOnly: true, sameSite: "strict", secure: config.cookieSecure, path: "/", maxAge: 0 });
}
