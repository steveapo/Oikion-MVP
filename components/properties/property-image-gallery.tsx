"use client";

import { useState } from "react";
import Image from "next/image";
import { placeholderBlurhash } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MediaAsset {
  url: string;
  isPrimary: boolean;
}

interface PropertyImageGalleryProps {
  images: MediaAsset[];
}

export function PropertyImageGallery({ images }: PropertyImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort images with primary first
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  if (sortedImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative">
        {/* Main Image */}
        <div 
          className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-t-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={sortedImages[selectedImageIndex]?.url}
            alt={`Property image ${selectedImageIndex + 1}`}
            fill
            className="object-cover transition-transform hover:scale-105"
            placeholder="blur"
            blurDataURL={placeholderBlurhash}
            priority={selectedImageIndex === 0}
          />
          
          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 rounded-md bg-black/50 px-3 py-1 text-sm text-white">
            {selectedImageIndex + 1} / {sortedImages.length}
          </div>

          {/* Primary Badge */}
          {sortedImages[selectedImageIndex]?.isPrimary && (
            <div className="absolute left-4 top-4 rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white">
              Primary
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 p-0 text-white hover:bg-black/40"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 p-0 text-white hover:bg-black/40"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Thumbnail Strip */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 p-4">
            {sortedImages.map((image, index) => (
              <button
                key={index}
                className={`relative h-16 w-20 overflow-hidden rounded border-2 ${
                  index === selectedImageIndex ? "border-primary" : "border-transparent"
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                    <div className="rounded bg-blue-500 px-1 py-0.5 text-xs text-white">1</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Gallery */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={sortedImages[selectedImageIndex]?.url}
                alt={`Property image ${selectedImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/20 p-0 text-white hover:bg-black/40"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation in Modal */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 p-0 text-white hover:bg-black/40"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 p-0 text-white hover:bg-black/40"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image Counter in Modal */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-black/50 px-3 py-1 text-sm text-white">
              {selectedImageIndex + 1} / {sortedImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}