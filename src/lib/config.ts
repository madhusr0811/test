import path from "node:path";

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export const config = {
  storagePath: path.resolve(process.env.STORAGE_PATH || "./data/storage"),
  storageIsDefault: !process.env.STORAGE_PATH,
  databasePath: path.resolve(process.env.DATABASE_PATH || "./data/testtranfer.db"),
  chunkSize: Math.round(num(process.env.CHUNK_SIZE_MB, 25) * 1024 * 1024),
  maxUploadBytes: Math.round(num(process.env.MAX_UPLOAD_GB, 100) * 1024 ** 3),
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, ""),
  storageWarnPercent: num(process.env.STORAGE_WARN_PERCENT, 90),
  cookieSecure:
    process.env.COOKIE_SECURE != null
      ? process.env.COOKIE_SECURE === "true"
      : (process.env.PUBLIC_BASE_URL || "").startsWith("https://"),
};

export const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".mkv", ".avi", ".jpg", ".jpeg", ".png", ".pdf", ".zip"];
