import { Hero } from "@/components/home/hero";
import { NextGameSection } from "@/components/home/next-game-section";
import { TeamSnapshot } from "@/components/home/team-snapshot";
import { LatestResultSection } from "@/components/home/latest-result-section";
import { TeamRecordSection } from "@/components/home/team-record-section";
import { NewsSection } from "@/components/home/news-section";
import { GallerySection } from "@/components/home/gallery-section";
import { AnnouncementBanner } from "@/components/announcements/announcement-banner";

import { getCurrentSeason } from "@/lib/services/season";
import { getNextGame, getLatestCompletedGame } from "@/lib/services/games";
import { getFeaturedPlayers } from "@/lib/services/players";
import { getTeamRecord } from "@/lib/services/stats";
import { getFeaturedAndSupportingArticles } from "@/lib/services/news";
import { getFeaturedGalleryImages } from "@/lib/services/gallery";
import { getActiveAnnouncements } from "@/lib/services/announcements";

export default async function HomePage() {
  const season = await getCurrentSeason();

  const [nextGame, latestGame, featuredPlayers, record, { featured, supporting }, images, announcements] =
    await Promise.all([
      season ? getNextGame(season.id) : Promise.resolve(null),
      season ? getLatestCompletedGame(season.id) : Promise.resolve(null),
      season ? getFeaturedPlayers(season.id) : Promise.resolve([]),
      season
        ? getTeamRecord(season.id)
        : Promise.resolve({
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            winPct: 0,
            avgPointsFor: 0,
            avgPointsAgainst: 0,
            avgRebounds: 0,
            avgAssists: 0,
          }),
      getFeaturedAndSupportingArticles(),
      getFeaturedGalleryImages(),
      getActiveAnnouncements(),
    ]);

  return (
    <>
      <Hero />

      {announcements.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 space-y-3">
          {announcements.slice(0, 2).map((a) => (
            <AnnouncementBanner key={a.id} announcement={a} />
          ))}
        </div>
      )}

      <NextGameSection game={nextGame} />
      <TeamRecordSection record={record} seasonLabel={season?.label} />
      <TeamSnapshot players={featuredPlayers} />
      <LatestResultSection game={latestGame} />
      <NewsSection featured={featured} supporting={supporting} />
      <GallerySection images={images} />
    </>
  );
}
