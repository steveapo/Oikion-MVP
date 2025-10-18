"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { canCreateContent } from "@/lib/roles";
import { ActionType } from "@prisma/client";

interface UploadImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Upload property images
 * In production, replace this with actual cloud storage (Cloudinary, S3, Vercel Blob)
 * This demo uses base64 data URLs for simplicity
 */
export async function uploadPropertyImages(
  propertyId: string,
  images: { dataUrl: string; isPrimary: boolean; displayOrder: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!canCreateContent(session.user.role)) {
      throw new Error("Insufficient permissions");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Verify property belongs to user's organization
    const db = prismaForOrg(session.user.organizationId);
    const property = await db.property.findFirst({
      where: {
        id: propertyId,
        organizationId: session.user.organizationId,
      },
    });

    if (!property) {
      throw new Error("Property not found or access denied");
    }

    // Validate image count
    if (images.length > 8) {
      throw new Error("Maximum 8 images allowed");
    }

    await db.mediaAsset.deleteMany({
      where: { propertyId },
    });

    // Create new media assets
    await db.mediaAsset.createMany({
      data: images.map((img, index) => ({
        propertyId,
        assetType: "IMAGE",
        url: img.dataUrl, // In production: upload to cloud storage and use URL
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      })),
    });

    // Log activity
    await prismaForOrg(session.user.organizationId).activity.create({
      data: {
        actionType: ActionType.MEDIA_ADDED,
        entityType: "PROPERTY",
        entityId: propertyId,
        actorId: session.user.id,
        organizationId: session.user.organizationId,
        payload: {
          imageCount: images.length,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to upload images:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload images",
    };
  }
}

/**
 * Delete a property image
 */
export async function deletePropertyImage(
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Verify image belongs to user's organization
    const db = prismaForOrg(session.user.organizationId);
    const image = await db.mediaAsset.findFirst({
      where: {
        id: imageId,
      },
      include: {
        property: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!image || image.property.organizationId !== session.user.organizationId) {
      throw new Error("Image not found or access denied");
    }

    // Delete the image
    await db.mediaAsset.delete({
      where: { id: imageId },
    });

    // If this was the primary image, set another as primary
    if (image.isPrimary) {
      const nextImage = await db.mediaAsset.findFirst({
        where: {
          propertyId: image.propertyId,
        },
        orderBy: {
          uploadedAt: "asc",
        },
      });

      if (nextImage) {
        await db.mediaAsset.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}
