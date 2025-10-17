"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { canCreateContent } from "@/lib/roles";
import { ActionType } from "@prisma/client";
import {
  ActionResponse,
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
} from "@/lib/action-response";
import { requireAuth } from "@/lib/auth-utils";
import { TOAST_SUCCESS, TOAST_ERROR } from "@/lib/toast-messages";

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
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to upload images."
    );
  }

  // Validate image count
  if (images.length > 8) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Maximum 8 images allowed."
    );
  }

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
    const db = prismaForOrg(user.organizationId);
    const property = await db.property.findFirst({
      where: {
        id: propertyId,
        organizationId: user.organizationId,
      },
    });

    if (!property) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Property not found or access denied."
      );
    }

    // Validate image count
    if (images.length > 8) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Maximum 8 images allowed."
      );
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
    await prismaForOrg(user.organizationId).activity.create({
      data: {
        actionType: ActionType.MEDIA_ADDED,
        entityType: "PROPERTY",
        entityId: propertyId,
        actorId: user.id,
        organizationId: user.organizationId,
        payload: {
          imageCount: images.length,
        },
      },
    });

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to upload images:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to upload images. Please try again."
    );
  }
}

/**
 * Delete a property image
 */
export async function deletePropertyImage(
  imageId: string
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {

    // Verify image belongs to user's organization
    const db = prismaForOrg(user.organizationId);
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

    if (!image || image.property.organizationId !== user.organizationId) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Image not found or access denied."
      );
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

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to delete image:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to delete image. Please try again."
    );
  }
}
