"use server";

import { prismaForOrg } from "@/lib/org-prisma";
import { requireAuth } from "@/lib/auth-utils";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  zodErrorsToValidationErrors,
  type ActionResponse 
} from "@/lib/action-response";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { 
  propertyFormSchema, 
  updatePropertySchema, 
  propertyFiltersSchema,
  type PropertyFormData,
  type PropertyFilters 
} from "@/lib/validations/property";
import { ActionType, EntityType, MarketingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper function to create activity log
async function createActivity(
  actionType: ActionType,
  entityId: string,
  actorId: string,
  organizationId: string,
  payload?: any
) {
  try {
    await prismaForOrg(organizationId).activity.create({
      data: {
        actionType,
        entityType: EntityType.PROPERTY,
        entityId,
        actorId,
        organizationId,
        payload: payload || {},
      },
    });
  } catch (error) {
    console.error("Failed to create activity log:", error);
    // Don't throw - activity logging shouldn't break the main operation
  }
}

// Create property action
export async function createProperty(
  data: PropertyFormData
): Promise<ActionResponse<{ propertyId: string }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to create properties."
    );
  }

  // Validation
  const result = propertyFormSchema.safeParse(data);
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Please check the form for errors.",
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  const validatedData = result.data;

  try {
    const db = prismaForOrg(user.organizationId);
    // Create property with related data in a transaction
    const property = await db.$transaction(async (tx) => {
      // Create property
      const newProperty = await tx.property.create({
        data: {
          propertyType: validatedData.propertyType,
          status: validatedData.status,
          transactionType: validatedData.transactionType,
          price: validatedData.price,
          bedrooms: validatedData.bedrooms,
          bathrooms: validatedData.bathrooms,
          size: validatedData.size,
          yearBuilt: validatedData.yearBuilt,
          features: validatedData.features || [],
          description: validatedData.description,
          organizationId: user.organizationId,
          createdBy: user.id,
        },
      });

      // Create address
      await tx.address.create({
        data: {
          propertyId: newProperty.id,
          country: validatedData.country,
          region: validatedData.region,
          city: validatedData.city,
          street: validatedData.street,
          number: validatedData.number,
          postalCode: validatedData.postalCode,
          locationText: validatedData.locationText,
        },
      });

      // Create listing
      await tx.listing.create({
        data: {
          propertyId: newProperty.id,
          marketingStatus: validatedData.marketingStatus,
          listPrice: validatedData.listPrice,
          publishedAt: validatedData.marketingStatus === MarketingStatus.ACTIVE ? new Date() : null,
          notes: validatedData.listingNotes,
        },
      });

      return newProperty;
    });

    // Create activity log
    await createActivity(
      ActionType.PROPERTY_CREATED,
      property.id,
      user.id,
      user.organizationId,
      {
        propertyType: validatedData.propertyType,
        price: validatedData.price,
        city: validatedData.city,
      }
    );

    revalidatePath("/dashboard/properties");
    return createSuccessResponse({ propertyId: property.id });
  } catch (error) {
    console.error("Failed to create property:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to create property. Please try again."
    );
  }
}

// Update property action
export async function updateProperty(
  id: string, 
  data: Partial<PropertyFormData>
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to update properties."
    );
  }

  // Validation
  const result = updatePropertySchema.safeParse({ ...data, id });
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Please check the form for errors.",
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  const validatedData = result.data;

  try {
    // Check if property exists and user has access
    const db = prismaForOrg(user.organizationId);
    const existingProperty = await db.property.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!existingProperty) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Property not found or you don't have access."
      );
    }

    // Update property with related data in a transaction
    const property = await db.$transaction(async (tx) => {
      // Update property
      const updatedProperty = await tx.property.update({
        where: { id },
        data: {
          propertyType: validatedData.propertyType,
          status: validatedData.status,
          transactionType: validatedData.transactionType,
          price: validatedData.price,
          bedrooms: validatedData.bedrooms,
          bathrooms: validatedData.bathrooms,
          size: validatedData.size,
          yearBuilt: validatedData.yearBuilt,
          features: validatedData.features,
          description: validatedData.description,
        },
      });

      // Update address if provided
      if (validatedData.city || validatedData.street || validatedData.region) {
        await tx.address.upsert({
          where: { propertyId: id },
          update: {
            country: validatedData.country,
            region: validatedData.region,
            city: validatedData.city,
            street: validatedData.street,
            number: validatedData.number,
            postalCode: validatedData.postalCode,
            locationText: validatedData.locationText,
          },
          create: {
            propertyId: id,
            country: validatedData.country || "Greece",
            region: validatedData.region,
            city: validatedData.city || "",
            street: validatedData.street,
            number: validatedData.number,
            postalCode: validatedData.postalCode,
            locationText: validatedData.locationText,
          },
        });
      }

      // Update listing if provided
      if (validatedData.marketingStatus || validatedData.listPrice) {
        const updateData: any = {};
        if (validatedData.marketingStatus !== undefined) {
          updateData.marketingStatus = validatedData.marketingStatus;
          if (validatedData.marketingStatus === MarketingStatus.ACTIVE) {
            updateData.publishedAt = new Date();
          } else if (validatedData.marketingStatus === MarketingStatus.ARCHIVED) {
            updateData.archivedAt = new Date();
          }
        }
        if (validatedData.listPrice !== undefined) {
          updateData.listPrice = validatedData.listPrice;
        }
        if (validatedData.listingNotes !== undefined) {
          updateData.notes = validatedData.listingNotes;
        }

        await tx.listing.upsert({
          where: { propertyId: id },
          update: updateData,
          create: {
            propertyId: id,
            marketingStatus: validatedData.marketingStatus || MarketingStatus.DRAFT,
            listPrice: validatedData.listPrice || validatedData.price || 0,
            notes: validatedData.listingNotes,
          },
        });
      }

      return updatedProperty;
    });

    // Create activity log
    await createActivity(
      ActionType.PROPERTY_UPDATED,
      property.id,
      user.id,
      user.organizationId,
      {
        updatedFields: Object.keys(data),
      }
    );

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}`);
    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to update property:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to update property. Please try again."
    );
  }
}

// Archive property action
export async function archiveProperty(id: string): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    // Check if property exists and user has access
    const db = prismaForOrg(user.organizationId);
    const property = await db.property.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!property) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Property not found or you don't have access."
      );
    }

    // Check permissions for deletion
    const isOwner = property.createdBy === user.id;
    if (!canDeleteContent(user.role, isOwner)) {
      return createErrorResponse(
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        "You don't have permission to archive this property."
      );
    }

    // Archive by updating listing status
    await db.listing.update({
      where: { propertyId: id },
      data: {
        marketingStatus: MarketingStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });

    // Create activity log
    await createActivity(
      ActionType.PROPERTY_ARCHIVED,
      id,
      user.id,
      user.organizationId
    );

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}`);
    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to archive property:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to archive property. Please try again."
    );
  }
}

// Get properties with filters
export async function getProperties(filters: Partial<PropertyFilters> = {}) {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Validate filters
  const result = propertyFiltersSchema.safeParse(filters);
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      "Invalid filter parameters.",
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  const validatedFilters = result.data;

  try {
    const where: any = {
      organizationId: user.organizationId,
    };

    // Apply filters
    if (validatedFilters.status) {
      where.status = validatedFilters.status;
    }
    if (validatedFilters.transactionType) {
      where.transactionType = validatedFilters.transactionType;
    }
    if (validatedFilters.propertyType) {
      where.propertyType = validatedFilters.propertyType;
    }
    if (validatedFilters.minPrice || validatedFilters.maxPrice) {
      where.price = {};
      if (validatedFilters.minPrice) {
        where.price.gte = validatedFilters.minPrice;
      }
      if (validatedFilters.maxPrice) {
        where.price.lte = validatedFilters.maxPrice;
      }
    }
    if (validatedFilters.location) {
      where.address = {
        OR: [
          { city: { contains: validatedFilters.location, mode: "insensitive" } },
          { region: { contains: validatedFilters.location, mode: "insensitive" } },
          { locationText: { contains: validatedFilters.location, mode: "insensitive" } },
        ],
      };
    }
    if (validatedFilters.bedrooms) {
      where.bedrooms = validatedFilters.bedrooms;
    }

    const db = prismaForOrg(user.organizationId);
    const [properties, totalCount] = await Promise.all([
      db.property.findMany({
        where,
        include: {
          address: true,
          listing: true,
          mediaAssets: {
            where: { isPrimary: true },
            take: 1,
          },
          creator: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (validatedFilters.page - 1) * validatedFilters.limit,
        take: validatedFilters.limit,
      }),
      db.property.count({ where }),
    ]);

    // Convert Decimal fields to numbers for client components
    const serializedProperties = properties.map(property => ({
      ...property,
      price: Number(property.price),
      size: property.size ? Number(property.size) : null,
      listing: property.listing ? {
        ...property.listing,
        listPrice: Number(property.listing.listPrice),
      } : null,
    }));

    return {
      properties: serializedProperties,
      totalCount,
      page: validatedFilters.page,
      totalPages: Math.ceil(totalCount / validatedFilters.limit),
    };
  } catch (error) {
    console.error("Failed to get properties:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to load properties. Please try again."
    );
  }
}

// Get single property by ID
export async function getProperty(id: string) {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const db = prismaForOrg(user.organizationId);
    const property = await db.property.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        address: true,
        listing: true,
        // OPTIMIZATION: Load all images (limited by upload UI to 8 max)
        mediaAssets: {
          orderBy: [
            { isPrimary: "desc" },
            { displayOrder: "asc" },
            { uploadedAt: "asc" },
          ],
        },
        creator: {
          select: { name: true, email: true },
        },
        // OPTIMIZATION: Limit to 10 most recent interactions
        interactions: {
          include: {
            client: { select: { name: true } },
            creator: { select: { name: true } },
          },
          orderBy: { timestamp: "desc" },
          take: 10,
        },
        // OPTIMIZATION: Limit to 5 most recent notes
        notes: {
          include: {
            creator: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        // OPTIMIZATION: Limit to 10 incomplete tasks
        tasks: {
          where: {
            status: { not: "COMPLETED" },
          },
          include: {
            creator: { select: { name: true } },
            assignee: { select: { name: true } },
          },
          orderBy: { dueDate: "asc" },
          take: 10,
        },
      },
    });

    if (!property) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Property not found or you don't have access."
      );
    }

    return property;
  } catch (error) {
    console.error("Failed to get property:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to load property. Please try again."
    );
  }
}

export async function getPropertyClients(propertyId: string) {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    // Get all clients who have interactions, notes, or tasks related to this property
    const db = prismaForOrg(user.organizationId);
    const clientsWithInteractions = await db.client.findMany({
      where: {
        organizationId: user.organizationId,
        OR: [
          { interactions: { some: { propertyId } } },
          { notes: { some: { propertyId } } },
          { tasks: { some: { propertyId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        clientType: true,
        email: true,
        phone: true,
        _count: {
          select: {
            interactions: {
              where: { propertyId },
            },
          },
        },
      },
    });

    // Transform the data to include interaction count
    return clientsWithInteractions.map(client => ({
      id: client.id,
      name: client.name,
      clientType: client.clientType,
      email: client.email,
      phone: client.phone,
      interactionCount: client._count.interactions,
    }));
  } catch (error) {
    console.error("Failed to get property clients:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to load property clients. Please try again."
    );
  }
}