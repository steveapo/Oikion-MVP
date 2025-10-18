"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/shared/icons";

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isPrimary: boolean;
  isUploading?: boolean;
  error?: string;
}

interface ImageUploadProps {
  onImagesChange: (images: ImageFile[]) => void;
  existingImages?: ImageFile[];
}

export function ImageUpload({ onImagesChange, existingImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>(existingImages);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compressToAvif = async (file: File): Promise<File> => {
    try {
      // Compression options optimized for web
      const options = {
        maxSizeMB: 0.5, // Target max size 500KB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: "image/avif", // Convert to AVIF format
        initialQuality: 0.85, // High quality
      };

      const compressedFile = await imageCompression(file, options);
      
      // Create a new File object with .avif extension
      const avifFileName = file.name.replace(/\.[^/.]+$/, ".avif");
      return new File([compressedFile], avifFileName, {
        type: "image/avif",
      });
    } catch (error) {
      console.error("Compression error:", error);
      throw new Error("Failed to compress image");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      
      // Check total count
      if (images.length + acceptedFiles.length > MAX_IMAGES) {
        setError(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      // Validate file sizes
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > MAX_FILE_SIZE
      );
      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the 5MB limit`);
        return;
      }

      setIsCompressing(true);

      try {
        const newImages: ImageFile[] = [];

        for (const file of acceptedFiles) {
          // Compress to AVIF
          const compressedFile = await compressToAvif(file);
          
          const imageFile: ImageFile = {
            id: `${Date.now()}-${Math.random()}`,
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            isPrimary: images.length === 0 && newImages.length === 0, // First image is primary
            isUploading: false,
          };

          newImages.push(imageFile);
        }

        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onImagesChange(updatedImages);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to process images"
        );
      } finally {
        setIsCompressing(false);
      }
    },
    [images, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    },
    maxFiles: MAX_IMAGES,
    disabled: images.length >= MAX_IMAGES || isCompressing,
  });

  const removeImage = (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    const updatedImages = images.filter((img) => img.id !== id);
    
    // If removed image was primary, make first image primary
    if (imageToRemove?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const setPrimaryImage = (id: string) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < MAX_IMAGES && (
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${isCompressing ? "cursor-not-allowed opacity-50" : "hover:border-primary"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            {isCompressing ? (
              <>
                <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-sm font-medium">
                  Compressing images to AVIF format...
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a moment for optimal quality
                </p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">
                  {isDragActive
                    ? "Drop images here"
                    : "Drag & drop images or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports JPG, PNG, WebP, GIF (Max {MAX_IMAGES} images, 5MB each)
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  Images will be automatically compressed to AVIF format
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Uploaded Images ({images.length}/{MAX_IMAGES})
            </p>
            <p className="text-xs text-muted-foreground">
              Click on an image to set it as primary
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`
                  group relative aspect-square overflow-hidden rounded-lg border-2
                  ${image.isPrimary ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"}
                `}
              >
                {/* Image */}
                <div
                  className="relative h-full w-full cursor-pointer"
                  onClick={() => setPrimaryImage(image.id)}
                >
                  <Image
                    src={image.preview}
                    alt="Property image"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                {/* Primary Badge */}
                {image.isPrimary && (
                  <Badge
                    variant="default"
                    className="absolute left-2 top-2 text-xs"
                  >
                    Primary
                  </Badge>
                )}

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-white">
                    {formatFileSize(image.file.size)}
                  </p>
                  <p className="text-xs text-white/70">AVIF</p>
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      {images.length === 0 && !isCompressing && (
        <div className="flex items-start gap-2 rounded-lg bg-muted p-4">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Why AVIF?</p>
            <p className="text-xs text-muted-foreground">
              AVIF provides superior compression (up to 50% smaller than JPEG) with
              better quality, faster page loads, and lower bandwidth costs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
