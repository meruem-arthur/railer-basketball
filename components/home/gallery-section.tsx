import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Camera } from "lucide-react";
import Image from "next/image";

interface HomeGalleryImage {
  id: string;
  secureUrl: string;
  altText: string;
}

export function GallerySection({ images }: { images: HomeGalleryImage[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeading
        title="Gallery"
        action={<ButtonLink href="/gallery" variant="outline">View gallery</ButtonLink>}
      />
      {images.length === 0 ? (
        <EmptyState icon={Camera} title="The camera roll is empty" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.slice(0, 8).map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden border border-rail-line">
              <Image
                src={img.secureUrl}
                alt={img.altText}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
