# TestTranfer

Self-hosted video delivery platform (Next.js + TypeScript + Tailwind + SQLite).

## Status

| Feature | State |
|---|---|
| Landing page, design system | Done |
| Admin login (scrypt hashing, DB sessions, httpOnly SameSite=Strict cookie, 5-fails/15-min rate limit, Origin check on writes) | Written, **untested** |
| Dashboard with real stats + storage figures | Written, **untested** |
| Create / list / enable-disable / expiry / password / regenerate link / delete deliveries | Written, **untested** |
| Chunked, resumable uploads to the storage folder (retry, pause, cancel, per-chunk SHA-256) | Written, **untested** |
| Storage page (capacity, largest deliveries, SSD-missing warning) | Written, **untested** |
| Private link `/d/<token>` | Placeholder only (file list, no downloads) |
| Client download page, video preview, range-request downloads | **Not implemented** (Stage 4) |
| Download tracking, background expiry cleanup | **Not implemented** (Stage 5) |
| Settings page, Activity page, logo/colour settings, cover image | **Not implemented** |

Not production-ready. Do not expose to the internet until the upload/download paths have been tested and reviewed (Stage 6).

## Run on a Mac

    npm install
    cp .env.example .env     # set ADMIN_EMAIL, ADMIN_PASSWORD (12+ chars), STORAGE_PATH
    npm run dev              # http://localhost:3000  -> /login

For a production-style run: `npm run build && npm start` (listens on 127.0.0.1:3000; put a tunnel in front).
`npm install` compiles `better-sqlite3`; if it fails, install Xcode command line tools (`xcode-select --install`).

The storage folder's **parent** must exist (so an unmounted SSD is reported, never replaced by another folder).
Uploads use the chunk size from `CHUNK_SIZE_MB`. Behind Cloudflare Tunnel keep chunks under 100 MB.

## Limits to know
- File integrity = exact size check + per-chunk SHA-256 (browser-sent where HTTPS/localhost allows, always server-computed). No whole-file hash yet.
- Abandoned uploads are cleaned up when the next upload starts (48 h), not by a background job yet.
- Deployments with no persistent disk (e.g. Render free tier) lose the database and files on restart.
