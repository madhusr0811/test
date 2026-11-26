# TestTranfer

Self-hosted video delivery platform (Next.js + TypeScript + Tailwind). Built in stages.

## Status

| Stage | Scope | State |
|---|---|---|
| 1 | Project setup, design system, landing, login UI, admin dashboard UI | **UI done, not yet run/tested** |
| 2 | SQLite, authentication, delivery management | Not started |
| 3 | SSD storage, chunked + resumable uploads | Not started |
| 4 | Private delivery pages, previews, downloads | Not started |
| 5 | Download tracking, expiry, cleanup | Not started |
| 6 | Security review, tests, Mac self-hosting guide | Not started |

Not production-ready. The login is disabled, `/admin` is unprotected, and all dashboard data is sample data until Stage 2.

## Run (Mac)

    npm install
    npm run dev      # http://localhost:3000
    npm run typecheck

Requires Node 20+. Copy `.env.example` to `.env` (used from Stage 2).
