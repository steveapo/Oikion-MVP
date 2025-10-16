"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
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
import { redirect } from "next/navigation";

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
export async function createProperty(data: PropertyFormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!canCreateContent(session.user.role)) {
    throw new Error("Insufficient permissions to create properties");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  // Validate input
  const validatedData = propertyFormSchema.parse(data);

  try {
    const db = prismaForOrg(session.user.organizationId!);
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
          organizationId: session.user.organizationId!,
          createdBy: session.user.id!,
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
      session.user.id,
      session.user.organizationId!,
      {
        propertyType: validatedData.propertyType,
        price: validatedData.price,
        city: validatedData.city,
      }
    );

    revalidatePath("/dashboard/properties");
    return { success: true, propertyId: property.id };
  } catch (error) {
    console.error("Failed to create property:", error);
    throw new Error("Failed to create property");
  }
}

// Update property action
export async function updateProperty(id: string, data: Partial<PropertyFormData>) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!canCreateContent(session.user.role)) {
    throw new Error("Insufficient permissions to update properties");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  // Validate input
  const validatedData = updatePropertySchema.parse({ ...data, id });

  try {
    // Check if property exists and user has access
    const db = prismaForOrg(session.user.organizationId);
    const existingProperty = await db.property.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingProperty) {
      throw new Error("Property not found or access denied");
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
      session.user.id,
      session.user.organizationId!,
      {
        updatedFields: Object.keys(data),
      }
    );

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update property:", error);
    throw new Error("Failed to update property");
  }
}

// Archive property action
export async function archiveProperty(id: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  try {
    // Check if property exists and user has access
    const db = prismaForOrg(session.user.organizationId);
    const property = await db.property.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!property) {
      throw new Error("Property not found or access denied");
    }

    // Check permissions for deletion
    const isOwner = property.createdBy === session.user.id;
    if (!canDeleteContent(session.user.role, isOwner)) {
      throw new Error("Insufficient permissions to archive this property");
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
      session.user.id,
      session.user.organizationId!
    );

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to archive property:", error);
    throw new Error("Failed to archive property");
  }
}

// Get properties with filters
export async function getProperties(filters: Partial<PropertyFilters> = {}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  // Validate filters
  const validatedFilters = propertyFiltersSchema.parse(filters);

  try {
    const where: any = {
      organizationId: session.user.organizationId,
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

    const db = prismaForOrg(session.user.organizationId);
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
    throw new Error("Failed to get properties");
  }
}

// Get single property by ID
export async function getProperty(id: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  try {
    const db = prismaForOrg(session.user.organizationId);
    const property = await db.property.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        address: true,
        listing: true,
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
        interactions: {
          include: {
            client: { select: { name: true } },
            creator: { select: { name: true } },
          },
          orderBy: { timestamp: "desc" },
          take: 10,
        },
        notes: {
          include: {
            creator: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        tasks: {
          include: {
            creator: { select: { name: true } },
            assignee: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!property) {
      throw new Error("Property not found or access denied");
    }

    return property;
  } catch (error) {
    console.error("Failed to get property:", error);
    throw new Error("Failed to get property");
  }
}

export async function getPropertyClients(propertyId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  try {
    // Get all clients who have interactions, notes, or tasks related to this property
    const db = prismaForOrg(session.user.organizationId);
    const clientsWithInteractions = await db.client.findMany({
      where: {
        organizationId: session.user.organizationId,
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
    throw new Error("Failed to get property clients");
  }
}