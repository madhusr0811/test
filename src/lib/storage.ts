import fs from "node:fs";
import path from "node:path";
import { ALLOWED_EXTENSIONS, config } from "./config";

const SUBDIRS = ["deliveries", "temporary_uploads", "thumbnails", "logs"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type StorageStatus = { ok: true } | { ok: false; reason: string };

/** Never silently falls back: if the drive/parent folder is missing, storage is reported unavailable. */
export function storageStatus(): StorageStatus {
  const root = config.storagePath;
  try {
    if (config.storageIsDefault) fs.mkdirSync(root, { recursive: true });
    else if (!fs.existsSync(path.dirname(root))) {
      return { ok: false, reason: `Folder ${path.dirname(root)} was not found. Is the SSD connected and mounted?` };
    }
    fs.mkdirSync(root, { recursive: true });
    for (const d of SUBDIRS) fs.mkdirSync(path.join(root, d), { recursive: true });
    fs.accessSync(root, fs.constants.W_OK);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: `Storage is not writable: ${(e as Error).message}` };
  }
}

export function safeJoin(base: string, ...parts: string[]): string {
  const resolved = path.resolve(base, ...parts);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) throw new Error("Path escapes storage");
  return resolved;
}

function assertId(id: string) {
  if (!UUID.test(id)) throw new Error("Invalid id");
}

export const deliveryDir = (id: string) => (assertId(id), safeJoin(config.storagePath, "deliveries", id));
export const uploadDir = (id: string) => (assertId(id), safeJoin(config.storagePath, "temporary_uploads", id));

export function sanitizeFilename(name: string): string {
  let n = path.basename(name.replace(/\\/g, "/"));
  n = n.replace(/[\u0000-\u001f<>:"|?*\/\\]/g, "_").replace(/\s+/g, " ").trim().replace(/^\.+/, "");
  if (n.length > 200) {
    const ext = path.extname(n);
    n = n.slice(0, 200 - ext.length) + ext;
  }
  return n;
}

export function hasAllowedExtension(name: string): boolean {
  return ALLOWED_EXTENSIONS.includes(path.extname(name).toLowerCase());
}

export function uniqueName(dir: string, name: string): string {
  const ext = path.extname(name), stem = path.basename(name, ext);
  let candidate = name, i = 1;
  while (fs.existsSync(path.join(dir, candidate))) candidate = `${stem} (${i++})${ext}`;
  return candidate;
}

export function diskStats(): { total: number; free: number } | null {
  try {
    const s = fs.statfsSync(config.storagePath);
    return { total: s.bsize * s.blocks, free: s.bsize * s.bavail };
  } catch { return null; }
}

export function removeDir(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
}
