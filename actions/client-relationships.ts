"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { RelationshipType, ActionType, EntityType } from "@prisma/client";
import * as z from "zod";
import {
  ActionResponse,
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  zodErrorsToValidationErrors,
} from "@/lib/action-response";
import { requireAuth } from "@/lib/auth-utils";
import { TOAST_SUCCESS, TOAST_ERROR } from "@/lib/toast-messages";

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
export async function createClientRelationship(
  data: ClientRelationshipData
): Promise<ActionResponse<{ relationshipId: string }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to create relationships."
    );
  }

  // Validation
  const result = clientRelationshipSchema.safeParse(data);
  if (!result.success) {
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      TOAST_ERROR.VALIDATION_FAILED,
      { validationErrors: zodErrorsToValidationErrors(result.error) }
    );
  }
  const validatedData = result.data;

  try {

    // Validate that both clients exist and belong to the user's organization
    const [fromClient, toClient] = await Promise.all([
      prismaForOrg(user.organizationId).client.findFirst({
        where: {
          id: validatedData.fromClientId,
          organizationId: user.organizationId,
        },
      }),
      prismaForOrg(user.organizationId).client.findFirst({
        where: {
          id: validatedData.toClientId,
          organizationId: user.organizationId,
        },
      }),
    ]);

    if (!fromClient || !toClient) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "One or both clients not found or access denied."
      );
    }

    // Prevent self-linking
    if (validatedData.fromClientId === validatedData.toClientId) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Cannot create a relationship with the same client."
      );
    }

    // Create the relationship
    const relationship = await prismaForOrg(user.organizationId).clientRelationship.create({
      data: {
        fromClientId: validatedData.fromClientId,
        toClientId: validatedData.toClientId,
        relationshipType: validatedData.relationshipType,
        position: validatedData.position || null,
        createdBy: user.id,
      },
    });

    // Log activity
    await createActivity(
      ActionType.CLIENT_RELATIONSHIP_CREATED,
      validatedData.fromClientId,
      user.id,
      user.organizationId,
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

    return createSuccessResponse({ relationshipId: relationship.id });
  } catch (error) {
    console.error("Failed to create client relationship:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to create relationship. Please try again."
    );
  }
}

/**
 * Delete a client relationship
 */
export async function deleteClientRelationship(
  relationshipId: string
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {

    // Get the relationship to verify ownership
    const relationship = await prismaForOrg(user.organizationId).clientRelationship.findFirst({
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

    if (!relationship || relationship.fromClient.organizationId !== user.organizationId) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Relationship not found or access denied."
      );
    }

    // Check permissions
    const canDelete = canDeleteContent(user.role, relationship.createdBy === user.id);
    if (!canDelete) {
      return createErrorResponse(
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        "You don't have permission to delete this relationship."
      );
    }

    // Log activity before deletion
    await createActivity(
      ActionType.CLIENT_RELATIONSHIP_DELETED,
      relationship.fromClientId,
      user.id,
      user.organizationId,
      {
        fromClientId: relationship.fromClientId,
        fromClientName: relationship.fromClient.name,
        toClientId: relationship.toClientId,
        toClientName: relationship.toClient.name,
        relationshipType: relationship.relationshipType,
        position: relationship.position,
      }
    );

    await prismaForOrg(user.organizationId).clientRelationship.delete({
      where: { id: relationshipId },
    });

    revalidatePath("/dashboard/relations");
    revalidatePath(`/dashboard/relations/${relationship.fromClientId}`);
    revalidatePath(`/dashboard/relations/${relationship.toClientId}`);

    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to delete client relationship:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to delete relationship. Please try again."
    );
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
