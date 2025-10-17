"use server";

import { auth } from "@/auth";
import { prismaForOrg } from "@/lib/org-prisma";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { PropertyRelationType, ActionType, EntityType } from "@prisma/client";
import * as z from "zod";

// Validation schema for property relationship
const propertyRelationshipSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  clientId: z.string().min(1, "Client is required"),
  relationshipType: z.nativeEnum(PropertyRelationType).default(PropertyRelationType.OTHER),
  notes: z.string().max(500).optional().or(z.literal("")),
});

type PropertyRelationshipData = z.infer<typeof propertyRelationshipSchema>;

/**
 * Create an activity log entry
 */
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
  }
}

/**
 * Create a relationship between a property and a client
 */
export async function createPropertyRelationship(data: PropertyRelationshipData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!canCreateContent(session.user.role)) {
      throw new Error("Insufficient permissions to create relationships");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    const validatedData = propertyRelationshipSchema.parse(data);

    // Validate that both property and client exist and belong to the user's organization
    const [property, client] = await Promise.all([
      prismaForOrg(session.user.organizationId).property.findFirst({
        where: {
          id: validatedData.propertyId,
          organizationId: session.user.organizationId,
        },
        include: {
          address: {
            select: { city: true, region: true },
          },
        },
      }),
      prismaForOrg(session.user.organizationId).client.findFirst({
        where: {
          id: validatedData.clientId,
          organizationId: session.user.organizationId,
        },
      }),
    ]);

    if (!property || !client) {
      throw new Error("Property or client not found or access denied");
    }

    // Create the relationship
    const relationship = await prismaForOrg(session.user.organizationId).propertyRelationship.create({
      data: {
        propertyId: validatedData.propertyId,
        clientId: validatedData.clientId,
        relationshipType: validatedData.relationshipType,
        notes: validatedData.notes || null,
        createdBy: session.user.id,
      },
    });

    // Log activity
    await createActivity(
      ActionType.PROPERTY_RELATIONSHIP_CREATED,
      validatedData.propertyId,
      session.user.id,
      session.user.organizationId,
      {
        propertyId: validatedData.propertyId,
        propertyAddress: `${property.address?.city || ""}, ${property.address?.region || ""}`.trim(),
        clientId: validatedData.clientId,
        clientName: client.name,
        relationshipType: validatedData.relationshipType,
        notes: validatedData.notes || null,
      }
    );

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${validatedData.propertyId}`);
    revalidatePath(`/dashboard/relations/${validatedData.clientId}`);

    return { success: true, relationshipId: relationship.id };
  } catch (error) {
    console.error("Failed to create property relationship:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create relationship",
    };
  }
}

/**
 * Delete a property relationship
 */
export async function deletePropertyRelationship(relationshipId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Get the relationship to verify ownership
    const relationship = await prismaForOrg(session.user.organizationId).propertyRelationship.findFirst({
      where: {
        id: relationshipId,
      },
      include: {
        property: {
          select: {
            organizationId: true,
            address: {
              select: { city: true, region: true },
            },
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!relationship || relationship.property.organizationId !== session.user.organizationId) {
      throw new Error("Relationship not found or access denied");
    }

    // Check permissions
    const canDelete = canDeleteContent(session.user.role, relationship.createdBy === session.user.id);
    if (!canDelete) {
      throw new Error("Insufficient permissions to delete this relationship");
    }

    // Log activity before deletion
    await createActivity(
      ActionType.PROPERTY_RELATIONSHIP_DELETED,
      relationship.propertyId,
      session.user.id,
      session.user.organizationId,
      {
        propertyId: relationship.propertyId,
        propertyAddress: `${relationship.property.address?.city || ""}, ${relationship.property.address?.region || ""}`.trim(),
        clientId: relationship.clientId,
        clientName: relationship.client.name,
        relationshipType: relationship.relationshipType,
        notes: relationship.notes,
      }
    );

    await prismaForOrg(session.user.organizationId).propertyRelationship.delete({
      where: { id: relationshipId },
    });

    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${relationship.propertyId}`);
    revalidatePath(`/dashboard/relations/${relationship.clientId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete property relationship:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete relationship",
    };
  }
}

/**
 * Get all relationships for a property
 */
export async function getPropertyRelationships(propertyId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Verify property belongs to user's organization
    const property = await prismaForOrg(session.user.organizationId).property.findFirst({
      where: {
        id: propertyId,
        organizationId: session.user.organizationId,
      },
    });

    if (!property) {
      throw new Error("Property not found or access denied");
    }

    // Get relationships for this property
    const relationships = await prismaForOrg(session.user.organizationId).propertyRelationship.findMany({
      where: { propertyId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            clientType: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return relationships;
  } catch (error) {
    console.error("Failed to get property relationships:", error);
    throw error;
  }
}

/**
 * Get all properties linked to a client
 */
export async function getClientProperties(clientId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Verify client belongs to user's organization
    const client = await prismaForOrg(session.user.organizationId).client.findFirst({
      where: {
        id: clientId,
        organizationId: session.user.organizationId,
      },
    });

    if (!client) {
      throw new Error("Client not found or access denied");
    }

    // Get properties linked to this client
    const relationships = await prismaForOrg(session.user.organizationId).propertyRelationship.findMany({
      where: { clientId },
      include: {
        property: {
          include: {
            address: true,
            listing: true,
            mediaAssets: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return relationships;
  } catch (error) {
    console.error("Failed to get client properties:", error);
    throw error;
  }
}
