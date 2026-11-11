-- Railers: RESET TO A FRESH SITE. THIS DELETES DATA PERMANENTLY.
--
-- BEFORE YOU RUN THIS
--   1. In Neon, create a BRANCH (or note the restore window) so you can go back if you change your mind.
--   2. Run 01-preview-before-reset.sql and check that the SUPER_ADMIN account you want to keep is listed and active.
--   3. Make sure `npx prisma migrate deploy` has already been run (new hero tables exist).
--
-- WHAT IT DOES (one all-or-nothing transaction)
--   DELETES : players, seasons, rosters, opponents, games, all statistics, news + categories, gallery albums + images,
--             announcements, tryout applications, media records, audit log, password-reset tokens,
--             and every user who is NOT a SUPER_ADMIN (e.g. the demo admin/editor accounts).
--   KEEPS   : SUPER_ADMIN accounts (email + password), site settings (team name, slogan, logo), social links,
--             and any hero slides / page banners (these are new, so they are normally empty).
--   NOTE    : photos already uploaded to Cloudinary are NOT deleted by this script (see the end of this file).

BEGIN;

-- Safety: abort (and roll everything back) unless an active Super Admin exists, so you can never lock yourself out.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "User" WHERE role = 'SUPER_ADMIN' AND active = true) THEN
    RAISE EXCEPTION 'No active SUPER_ADMIN found. Nothing was deleted.';
  END IF;
END $$;

-- 1) Content. One statement, deliberately WITHOUT "CASCADE": if some table you didn't expect depends on these,
--    Postgres stops with an error instead of silently deleting more.
TRUNCATE TABLE
  "PlayerGameStat", "TeamGameStat", "GameQuarterScore",
  "GalleryImage", "GalleryAlbum",
  "Game", "PlayerSeason", "Player", "TeamSeason", "Opponent",
  "NewsArticle", "NewsCategory",
  "Announcement", "TryoutApplication", "MediaAsset",
  "AuditLog", "PasswordResetToken";

-- 2) Users: keep Super Admins only. (Their news/albums are already gone, so this cannot hit a foreign-key error.)
--    To keep ONE specific Super Admin and remove any other, use instead:
--      DELETE FROM "User" WHERE email <> 'you@example.com';
DELETE FROM "User" WHERE role <> 'SUPER_ADMIN';

-- 3) OPTIONAL: also reset branding (team name, slogan, logo, social links) back to the defaults.
--    Leave these two lines commented out to keep your branding.
-- TRUNCATE TABLE "SiteSetting", "SocialLink";

-- 4) Verify before saving. You should see only your Super Admin(s) and zeros below.
SELECT email, role, active FROM "User";
SELECT (SELECT count(*) FROM "Player") AS players, (SELECT count(*) FROM "Game") AS games,
       (SELECT count(*) FROM "NewsArticle") AS news, (SELECT count(*) FROM "GalleryImage") AS gallery_images;

COMMIT;

-- AFTER RUNNING
--   * Sign in with your Super Admin, then change its password (the old one is in your public Git history).
--   * Create the first season in Admin → Seasons, then add players and games.
--   * Cloudinary: to free the old photos, open the Cloudinary Media Library and delete the "srid-railers" folder
--     (only after you've confirmed you no longer need those images).
