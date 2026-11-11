import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Camera } from "lucide-react";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox";

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
        <GalleryLightbox
          images={images.slice(0, 8).map((img) => ({ id: img.id, secureUrl: img.secureUrl, altText: img.altText, caption: null }))}
          gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-3"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      )}
    </section>
  );
}
