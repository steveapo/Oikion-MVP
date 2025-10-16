"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { RelationshipType, ActionType, EntityType } from "@prisma/client";
import * as z from "zod";

// Validation schema for client relationship
const clientRelationshipSchema = z.object({
  fromClientId: z.string().min(1, "From client is required"),
  toClientId: z.string().min(1, "To client is required"),
  relationshipType: z.nativeEnum(RelationshipType).default(RelationshipType.OTHER),
  position: z.string().max(200).optional().or(z.literal("")),
});

type ClientRelationshipData = z.infer<typeof clientRelationshipSchema>;

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
        entityType: EntityType.CLIENT,
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
 * Create a relationship between two clients
 */
export async function createClientRelationship(data: ClientRelationshipData) {
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

    const validatedData = clientRelationshipSchema.parse(data);

    // Validate that both clients exist and belong to the user's organization
    const [fromClient, toClient] = await Promise.all([
      prismaForOrg(session.user.organizationId).client.findFirst({
        where: {
          id: validatedData.fromClientId,
          organizationId: session.user.organizationId,
        },
      }),
      prismaForOrg(session.user.organizationId).client.findFirst({
        where: {
          id: validatedData.toClientId,
          organizationId: session.user.organizationId,
        },
      }),
    ]);

    if (!fromClient || !toClient) {
      throw new Error("One or both clients not found or access denied");
    }

    // Prevent self-linking
    if (validatedData.fromClientId === validatedData.toClientId) {
      throw new Error("Cannot create a relationship with the same client");
    }

    // Create the relationship
    const relationship = await prismaForOrg(session.user.organizationId).clientRelationship.create({
      data: {
        fromClientId: validatedData.fromClientId,
        toClientId: validatedData.toClientId,
        relationshipType: validatedData.relationshipType,
        position: validatedData.position || null,
        createdBy: session.user.id,
      },
    });

    // Log activity
    await createActivity(
      ActionType.CLIENT_RELATIONSHIP_CREATED,
      validatedData.fromClientId,
      session.user.id,
      session.user.organizationId,
      {
        fromClientId: validatedData.fromClientId,
        fromClientName: fromClient.name,
        toClientId: validatedData.toClientId,
        toClientName: toClient.name,
        relationshipType: validatedData.relationshipType,
        position: validatedData.position || null,
      }
    );

    revalidatePath("/dashboard/relations");
    revalidatePath(`/dashboard/relations/${validatedData.fromClientId}`);
    revalidatePath(`/dashboard/relations/${validatedData.toClientId}`);

    return { success: true, relationshipId: relationship.id };
  } catch (error) {
    console.error("Failed to create client relationship:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create relationship",
    };
  }
}

/**
 * Delete a client relationship
 */
export async function deleteClientRelationship(relationshipId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("User must belong to an organization");
    }

    // Get the relationship to verify ownership
    const relationship = await prismaForOrg(session.user.organizationId).clientRelationship.findFirst({
      where: {
        id: relationshipId,
      },
      include: {
        fromClient: {
          select: {
            organizationId: true,
            name: true,
          },
        },
        toClient: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!relationship || relationship.fromClient.organizationId !== session.user.organizationId) {
      throw new Error("Relationship not found or access denied");
    }

    // Check permissions
    const canDelete = canDeleteContent(session.user.role, relationship.createdBy === session.user.id);
    if (!canDelete) {
      throw new Error("Insufficient permissions to delete this relationship");
    }

    // Log activity before deletion
    await createActivity(
      ActionType.CLIENT_RELATIONSHIP_DELETED,
      relationship.fromClientId,
      session.user.id,
      session.user.organizationId,
      {
        fromClientId: relationship.fromClientId,
        fromClientName: relationship.fromClient.name,
        toClientId: relationship.toClientId,
        toClientName: relationship.toClient.name,
        relationshipType: relationship.relationshipType,
        position: relationship.position,
      }
    );

    await prismaForOrg(session.user.organizationId).clientRelationship.delete({
      where: { id: relationshipId },
    });

    revalidatePath("/dashboard/relations");
    revalidatePath(`/dashboard/relations/${relationship.fromClientId}`);
    revalidatePath(`/dashboard/relations/${relationship.toClientId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete client relationship:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete relationship",
    };
  }
}

/**
 * Get all relationships for a client
 */
export async function getClientRelationships(clientId: string) {
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

    // Get relationships where this client is involved
    const [relationshipsFrom, relationshipsTo] = await Promise.all([
      prismaForOrg(session.user.organizationId).clientRelationship.findMany({
        where: { fromClientId: clientId },
        include: {
          toClient: {
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
      }),
      prismaForOrg(session.user.organizationId).clientRelationship.findMany({
        where: { toClientId: clientId },
        include: {
          fromClient: {
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
      }),
    ]);

    return {
      relationshipsFrom,
      relationshipsTo,
    };
  } catch (error) {
    console.error("Failed to get client relationships:", error);
    throw error;
  }
}
