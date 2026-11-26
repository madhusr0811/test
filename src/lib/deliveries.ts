import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { config } from "./config";
import { getDb } from "./db";

export type DeliveryStatus = "active" | "expired" | "disabled";

export interface DeliveryRow {
  id: string; token: string; client: string; event: string; title: string; message: string;
  deliveryDate: string; expiresAt: string; allowPreviews: boolean; allowDownloads: boolean;
  enabled: boolean; hasPassword: boolean; createdAt: string;
  fileCount: number; totalBytes: number; downloads: number; status: DeliveryStatus;
}

interface Raw {
  id: string; token: string; client: string; event: string; title: string; message: string;
  delivery_date: string; expires_at: string; password_hash: string | null;
  allow_previews: number; allow_downloads: number; enabled: number; created_at: string;
  file_count: number; total_bytes: number; downloads: number;
}

const SELECT = `
SELECT d.*,
  (SELECT COUNT(*) FROM files f WHERE f.delivery_id = d.id) AS file_count,
  (SELECT COALESCE(SUM(size),0) FROM files f WHERE f.delivery_id = d.id) AS total_bytes,
  (SELECT COUNT(*) FROM download_events e WHERE e.delivery_id = d.id) AS downloads
FROM deliveries d`;

export const newToken = () => randomBytes(24).toString("base64url");

function map(r: Raw): DeliveryRow {
  const status: DeliveryStatus = !r.enabled ? "disabled" : r.expires_at < new Date().toISOString() ? "expired" : "active";
  return {
    id: r.id, token: r.token, client: r.client, event: r.event, title: r.title, message: r.message,
    deliveryDate: r.delivery_date, expiresAt: r.expires_at, allowPreviews: !!r.allow_previews,
    allowDownloads: !!r.allow_downloads, enabled: !!r.enabled, hasPassword: !!r.password_hash,
    createdAt: r.created_at, fileCount: r.file_count, totalBytes: r.total_bytes, downloads: r.downloads, status,
  };
}

export const listDeliveries = (): DeliveryRow[] =>
  (getDb().prepare(`${SELECT} ORDER BY d.created_at DESC`).all() as Raw[]).map(map);

export function getDelivery(id: string): DeliveryRow | null {
  const r = getDb().prepare(`${SELECT} WHERE d.id = ?`).get(id) as Raw | undefined;
  return r ? map(r) : null;
}

export interface FileRow { id: string; name: string; size: number; createdAt: string }

export const listFiles = (deliveryId: string): FileRow[] =>
  (getDb().prepare("SELECT id, name, size, created_at FROM files WHERE delivery_id = ? ORDER BY created_at").all(deliveryId) as
    { id: string; name: string; size: number; created_at: string }[])
    .map((f) => ({ id: f.id, name: f.name, size: f.size, createdAt: f.created_at }));

export function deliveryUrl(token: string): string {
  if (config.publicBaseUrl) return `${config.publicBaseUrl}/d/${token}`;
  const h = headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/d/${token}`;
}
