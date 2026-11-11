-- Railers: PREVIEW (read-only). Safe to run any time. Nothing is changed.
-- Run in Neon → SQL Editor. Shows who the accounts are and how much data exists.

SELECT email, name, role, active FROM "User" ORDER BY role, email;

SELECT * FROM (
  SELECT 'Players' AS what, count(*) AS rows FROM "Player"
  UNION ALL SELECT 'Seasons', count(*) FROM "TeamSeason"
  UNION ALL SELECT 'Roster entries (player-seasons)', count(*) FROM "PlayerSeason"
  UNION ALL SELECT 'Opponents', count(*) FROM "Opponent"
  UNION ALL SELECT 'Games', count(*) FROM "Game"
  UNION ALL SELECT 'Player game stats', count(*) FROM "PlayerGameStat"
  UNION ALL SELECT 'News articles', count(*) FROM "NewsArticle"
  UNION ALL SELECT 'News categories', count(*) FROM "NewsCategory"
  UNION ALL SELECT 'Gallery albums', count(*) FROM "GalleryAlbum"
  UNION ALL SELECT 'Gallery images', count(*) FROM "GalleryImage"
  UNION ALL SELECT 'Announcements', count(*) FROM "Announcement"
  UNION ALL SELECT 'Tryout applications', count(*) FROM "TryoutApplication"
  UNION ALL SELECT 'Media assets', count(*) FROM "MediaAsset"
  UNION ALL SELECT 'Audit log entries', count(*) FROM "AuditLog"
  UNION ALL SELECT 'Site settings (KEPT)', count(*) FROM "SiteSetting"
  UNION ALL SELECT 'Social links (KEPT)', count(*) FROM "SocialLink"
) t;
