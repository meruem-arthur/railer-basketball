import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { GalleryCard } from "@/components/gallery/gallery-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Camera } from "lucide-react";
import { getAlbums } from "@/lib/services/gallery";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from UMaT SRID Railers games, training, and events.",
};

const CATEGORIES = [
  { label: "Game Day", value: "GAME_DAY" },
  { label: "Training", value: "TRAINING" },
  { label: "Team", value: "TEAM" },
  { label: "Tournaments", value: "TOURNAMENTS" },
  { label: "Events", value: "EVENTS" },
  { label: "Behind the Scenes", value: "BEHIND_THE_SCENES" },
];

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const albums = await getAlbums(category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading title="Gallery" />

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/gallery"
          className={cn(
            "px-3 py-1.5 text-sm border",
            !category ? "border-rail-gold text-rail-gold" : "border-rail-line text-rail-silver"
          )}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={`/gallery?category=${c.value}`}
            className={cn(
              "px-3 py-1.5 text-sm border",
              category === c.value ? "border-rail-gold text-rail-gold" : "border-rail-line text-rail-silver"
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {albums.length === 0 ? (
        <EmptyState icon={Camera} title="The camera roll is empty" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album) => (
            <GalleryCard
              key={album.id}
              slug={album.slug}
              title={album.title}
              coverImageUrl={album.coverImageUrl ?? album.images[0]?.secureUrl ?? null}
              imageCount={album._count.images}
            />
          ))}
        </div>
      )}
    </div>
  );
}
