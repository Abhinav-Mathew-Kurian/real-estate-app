"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = { url: string; publicId: string; alt?: string };

export function ImageGallery({
  images,
  coverIndex,
  title,
}: {
  images: GalleryImage[];
  coverIndex: number;
  title: string;
}) {
  const [activeIdx, setActiveIdx] = useState(coverIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video rounded-2xl bg-mist flex items-center justify-center text-muted-foreground">
        No images available
      </div>
    );
  }

  const activeImage = images[activeIdx] ?? images[0];

  function openLightbox(idx: number) {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function prevLightbox(e: React.MouseEvent) {
    e.stopPropagation();
    setLightboxIdx((i) => (i - 1 + images.length) % images.length);
  }

  function nextLightbox(e: React.MouseEvent) {
    e.stopPropagation();
    setLightboxIdx((i) => (i + 1) % images.length);
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-video rounded-2xl overflow-hidden bg-mist cursor-zoom-in"
        onClick={() => openLightbox(activeIdx)}
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt ?? title}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-opacity duration-300"
          priority
        />
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.publicId}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIdx
                  ? "border-emerald-brand shadow-sm"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${title} image ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/40 backdrop-blur-sm"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevLightbox}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-full bg-black/40 backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={nextLightbox}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-full bg-black/40 backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIdx].url}
              alt={images[lightboxIdx].alt ?? title}
              width={1200}
              height={800}
              className="object-contain max-h-[85vh] w-full"
              sizes="90vw"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
