"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ImageUpload } from "./image-upload";
import { uploadPropertyImages } from "@/actions/media";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface PropertyImageManagerProps {
  propertyId: string;
  existingImages?: ImageFile[];
  onUploadComplete?: () => void;
}

export function PropertyImageManager({
  propertyId,
  existingImages = [],
  onUploadComplete,
}: PropertyImageManagerProps) {
  const [images, setImages] = useState<ImageFile[]>(existingImages);
  const [isPending, startTransition] = useTransition();

  const convertFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    startTransition(async () => {
      try {
        // Convert all images to data URLs
        const imageDataUrls = await Promise.all(
          images.map(async (img, index) => ({
            dataUrl: await convertFileToDataUrl(img.file),
            isPrimary: img.isPrimary,
            displayOrder: index,
          }))
        );

        const result = await uploadPropertyImages(propertyId, imageDataUrls);

        if (result.success) {
          toast.success(`${images.length} image(s) uploaded successfully!`);
          setImages([]);
          onUploadComplete?.();
        } else {
          toast.error(result.error || "Failed to upload images");
        }
      } catch (error) {
        toast.error("Failed to upload images");
        console.error(error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Images</CardTitle>
        <CardDescription>
          Upload up to 8 high-quality images. Images will be automatically compressed
          to AVIF format for optimal performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUpload onImagesChange={setImages} existingImages={existingImages} />

        {images.length > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {images.length} image(s) ready to upload
            </p>
            <Button onClick={handleUpload} disabled={isPending}>
              {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Uploading..." : "Upload Images"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
