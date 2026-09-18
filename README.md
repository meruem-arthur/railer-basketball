# UMaT SRID Railers — Basketball Platform

The official digital platform for the UMaT SRID Railers basketball team —
the men's basketball program of the School of Rail and Infrastructure
Development at the University of Mines and Technology, Ghana.

This is a production-ready, multi-season platform: a public website plus a
secure admin CMS backed by a relational PostgreSQL database. It's built to
stay in use across many seasons, players, and administrators — not a
one-off project site.

## Contents

- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Local setup](#local-setup)
- [Neon (database) setup](#neon-database-setup)
- [Cloudinary (media) setup](#cloudinary-media-setup)
- [Brevo (email) setup](#brevo-email-setup)
- [Authentication](#authentication)
- [Database migrations & seeding](#database-migrations--seeding)
- [Development](#development)
- [Production build](#production-build)
- [Deploying to Vercel](#deploying-to-vercel)
- [Demo accounts](#demo-accounts)
- [Architecture notes](#architecture-notes)
- [Known limitations / next steps](#known-limitations--next-steps)

## Technology stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript + React |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Auth.js / NextAuth (credentials + hashed passwords) |
| Media | Cloudinary |
| Email | Brevo (transactional) |
| Validation | Zod |
| Forms | React Hook Form / native form actions with `useActionState` |
| Rich text | Tiptap |
| Hosting | Vercel |

There is no separate backend server — the API layer lives entirely inside
Next.js as Route Handlers and Server Actions, deployed as part of the same
Vercel project.

## Project structure

```
app/
  (public)/            Public site — layout wraps every page in Navbar/Footer
    page.tsx            Homepage
    team/                Roster + player profiles
    schedule/            Fixtures
    results/             Results
    games/[id]/          Game report / box score
    stats/               Team & player statistics
    news/                News list + article pages
    gallery/             Albums + lightbox
    tryouts/             Public application form
    announcements/
    about/
    contact/
  admin/
    login/, forgot-password/, reset-password/   Auth flows (no sidebar)
    (dashboard)/         Everything behind the auth gate (sidebar + header)
      players/, seasons/, games/, statistics/, news/, gallery/,
      announcements/, tryouts/, users/, settings/
  sitemap.ts, robots.ts, not-found.tsx, global-error.tsx

components/
  ui/          Design-system primitives (Button, Badge, Card, DataTable, ...)
  layout/      Navbar, Footer
  home/        Homepage sections
  team/, games/, news/, gallery/, announcements/, tryouts/, contact/
  admin/       Admin-only components (sidebar, forms, uploaders, editors)

lib/
  db/          Prisma client singleton
  auth/        NextAuth config (edge-safe + full), session/role helpers
  cloudinary/  Upload/delete helpers
  email/       Brevo transactional email helpers
  services/    All data-access functions (one file per domain)
  validation/  Zod schemas, one file per domain
  utils/       Formatting and small helpers

prisma/
  schema.prisma   Full relational schema
  seed.ts         Demo data (see "Database migrations & seeding")
```

## Local setup

**Requirements:** Node.js 20 or later, npm, a Neon account (or any
PostgreSQL 15+ instance for local testing), a Cloudinary account, a Brevo
account.

```bash
git clone <your-repo-url>
cd srid-railers
npm install
cp .env.example .env.local
```

Fill in `.env.local` with real values — see the sections below for where
each one comes from. At minimum you need `DATABASE_URL`, `DIRECT_URL`, and
`AUTH_SECRET` to run the app; Cloudinary and Brevo can be added once you're
ready to test uploads and email.

## Neon (database) setup

1. Create a project at [neon.tech](https://neon.tech) and a database
   inside it (e.g. `sridrailers`).
2. Neon gives you two connection strings — a **pooled** one (port 6543,
   goes through PgBouncer) and a **direct/unpooled** one (port 5432).
3. Set `DATABASE_URL` to the **pooled** string — the app uses this at
   runtime, and pooling is what keeps Vercel's serverless functions from
   exhausting Neon's connection limit.
4. Set `DIRECT_URL` to the **unpooled** string — Prisma Migrate needs a
   direct connection to run schema migrations; it can't go through the
   pooler.
5. Run the migration and seed steps below.

Neon holds all relational data (players, games, stats, news, etc.) — it
never stores images. Media lives in Cloudinary; Postgres only stores the
resulting URLs and metadata.

## Cloudinary (media) setup

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the dashboard, copy your **Cloud name**, **API key**, and **API
   secret** into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
   `CLOUDINARY_API_SECRET`.
3. No manual folder setup is required — the app organizes uploads into
   `srid-railers/players`, `srid-railers/gallery`, `srid-railers/news`,
   `srid-railers/teams`, `srid-railers/opponents`, and
   `srid-railers/misc` automatically.
4. All uploads go through server-side admin actions (`lib/services/media.ts`
   -> `lib/cloudinary/upload.ts`), so your API secret never reaches the
   browser.

## Brevo (email) setup

1. Create an account at [brevo.com](https://www.brevo.com) and verify a
   sender email/domain.
2. Generate an API key under **SMTP & API -> API Keys**.
3. Set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME`.
4. Brevo powers two flows: admin password-reset emails, and tryout
   application confirmation emails. If these variables are left unset,
   the app still runs — the relevant actions detect the missing config
   and skip sending rather than crashing (see `isEmailConfigured` in
   `lib/email/brevo.ts`), which is convenient for local development.

## Authentication

Admin auth uses NextAuth's Credentials provider with bcrypt-hashed
passwords and JWT sessions (8-hour expiry). Middleware protects every
`/admin/*` route at the edge; server components and Server Actions also
re-check the session and role server-side, so route protection never
depends on hiding a button in the UI.

Password reset works via a `PasswordResetToken` table: a random token is
generated, hashed (SHA-256) before storage, emailed as a one-time link,
and expires after 30 minutes or first use — the raw token is never stored
or logged.

Roles are `SUPER_ADMIN`, `ADMIN`, and `EDITOR`, enforced centrally in
`lib/auth/session.ts` (`requireRole`) and checked at the top of every
mutating Server Action.

## Database migrations & seeding

```bash
npx prisma migrate dev --name init   # creates tables from schema.prisma
npm run db:seed                      # populates demo data
```

`prisma/seed.ts` creates:

- 3 admin accounts (one per role — see [Demo accounts](#demo-accounts))
- 2 seasons (`2025/26` archived, `2026/27` current)
- 10 fictional players assigned to the current season
- 6 games (3 completed with full box scores, quarter-by-quarter scores,
  and an MVP; 3 upcoming)
- 5 published news articles across different categories
- 3 gallery albums with photos
- 5 active announcements
- 5 tryout applications across different statuses
- Site settings and social links

All photos in the seed data are placeholder images — replace them via the
admin Cloudinary uploader once real assets are available.

In production, run `npx prisma migrate deploy` (not `migrate dev`) as part
of your deploy step, and seed only once against a fresh database if you
want the demo content — most teams will skip seeding in production and
enter real data through the admin UI instead.

## Development

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the admin CMS.

## Production build

```bash
npm run build
npm run start
```

`next build` will fail loudly on TypeScript errors, missing imports, or
broken routes — there's no fallback that papers over build errors.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, **Import Project** from that GitHub repo.
3. Add every variable from `.env.example` under **Project Settings ->
   Environment Variables** (use your real Neon/Cloudinary/Brevo values,
   and set `NEXT_PUBLIC_SITE_URL` to your production domain).
4. Add a **Build Command** override if you want migrations to run as part
   of deploy: `npx prisma migrate deploy && next build`. Otherwise, run
   `npx prisma migrate deploy` manually against production before/after
   your first deploy.
5. Deploy. Vercel hosts the full Next.js app — frontend, admin, and the
   Server Action / Route Handler API layer — as one project; Neon,
   Cloudinary, and Brevo are the only external services.

Because Prisma's connection pooling is configured for Neon's pooled
connection string (see `lib/db/prisma.ts`), this deploys cleanly to
Vercel's serverless functions without exhausting Neon's connection limit.

## Demo accounts

Created by `prisma/seed.ts`. **Change these passwords immediately if you
ever seed a production database** — they exist for local/demo use only.

| Role | Email | Password |
|---|---|---|
| Super Admin | `super.admin@sridrailers.demo` | `RailersDemo2026!` |
| Admin | `admin@sridrailers.demo` | `RailersDemo2026!` |
| Editor | `editor@sridrailers.demo` | `RailersDemo2026!` |

## Architecture notes

- **Multi-season by design.** `Player` (identity) and `PlayerSeason`
  (a player's jersey number, position, and stats for one season) are
  separate models on purpose — a player's profile is never duplicated
  season to season, and historical statistics are never overwritten or
  deleted when a player leaves the team or a new season starts.
- **Nothing is hardcoded.** Players, games, results, statistics, news,
  gallery metadata, and announcements are all database-driven. Team and
  player statistics (PPG, RPG, APG, win %) are computed from
  `PlayerGameStat` / `Game` rows in `lib/services/stats.ts`, never stored
  as static numbers.
- **Soft deletion for players.** Deactivating a player never deletes their
  row or their season stats — it only flips `active: false`, preserving
  history.
- **Audit log.** Every meaningful admin mutation (player/game/news/gallery
  changes, tryout status changes, user management, password resets) is
  recorded via `lib/services/audit.ts` and shown on the admin dashboard.
- **Server-enforced authorization.** Role checks live in Server Actions,
  not just in what buttons the UI shows.

## Known limitations / next steps

Built end-to-end against the full schema and cross-checked field-by-field,
but not yet run against a live database in this environment (see commit/
build notes). Before going live:

1. Run `npx prisma migrate dev` and `npm run db:seed` against a real Neon
   database and fix anything that surfaces — the schema and seed script
   have been carefully checked by hand but not machine-verified end to end.
2. Run `npm run build` and resolve any TypeScript errors that only appear
   once the Prisma client is generated (generated types weren't available
   while writing this code).
3. Replace seed placeholder images with real team photography via the
   admin Cloudinary uploader.
4. Review and rotate the demo admin passwords before any real deployment.
