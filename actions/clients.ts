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
  clientFormSchema, 
  updateClientSchema, 
  clientFiltersSchema,
  type ClientFormData,
  type ClientFilters 
} from "@/lib/validations/client";
import { ActionType, EntityType } from "@prisma/client";
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

// Create client action
export async function createClient(
  data: ClientFormData
): Promise<ActionResponse<{ clientId: string }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to create clients."
    );
  }

  // Validation
  const result = clientFormSchema.safeParse(data);
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
    const client = await db.client.create({
      data: {
        clientType: validatedData.clientType,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        secondaryEmail: validatedData.secondaryEmail || null,
        secondaryPhone: validatedData.secondaryPhone || null,
        tags: validatedData.tags || [],
        organizationId: user.organizationId,
        createdBy: user.id,
      },
    });

    await createActivity(
      ActionType.CLIENT_CREATED,
      client.id,
      user.id,
      user.organizationId,
      {
        clientType: validatedData.clientType,
        name: validatedData.name,
      }
    );

    revalidatePath("/dashboard/relations");
    return createSuccessResponse({ clientId: client.id });
  } catch (error) {
    console.error("Failed to create client:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to create client. Please try again."
    );
  }
}

// Update client action
export async function updateClient(
  id: string, 
  data: Partial<ClientFormData>
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to update clients."
    );
  }

  // Validation
  const result = updateClientSchema.safeParse({ ...data, id });
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
    const existingClient = await db.client.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!existingClient) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Client not found or you don't have access."
      );
    }

    const client = await db.client.update({
      where: { id },
      data: {
        clientType: validatedData.clientType,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        secondaryEmail: validatedData.secondaryEmail || null,
        secondaryPhone: validatedData.secondaryPhone || null,
        tags: validatedData.tags || [],
      },
    });

    await createActivity(
      ActionType.CLIENT_UPDATED,
      client.id,
      user.id,
      user.organizationId,
      {
        updatedFields: Object.keys(data),
      }
    );

    revalidatePath("/dashboard/relations");
    revalidatePath(`/dashboard/relations/${id}`);
    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to update client:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to update client. Please try again."
    );
  }
}

// Delete client action
export async function deleteClient(id: string): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const db = prismaForOrg(user.organizationId);
    const client = await db.client.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!client) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Client not found or you don't have access."
      );
    }

    const isOwner = client.createdBy === user.id;
    if (!canDeleteContent(user.role, isOwner)) {
      return createErrorResponse(
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        "You don't have permission to delete this client."
      );
    }

    await db.client.delete({
      where: { id },
    });

    revalidatePath("/dashboard/relations");
    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to delete client:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to delete client. Please try again."
    );
  }
}

// Get clients with filters
export async function getClients(filters: Partial<ClientFilters> = {}) {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Validation
  const result = clientFiltersSchema.safeParse(filters);
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

    if (validatedFilters.clientType) {
      where.clientType = validatedFilters.clientType;
    }

    if (validatedFilters.search) {
      where.OR = [
        { name: { contains: validatedFilters.search, mode: "insensitive" } },
        { email: { contains: validatedFilters.search, mode: "insensitive" } },
        { phone: { contains: validatedFilters.search, mode: "insensitive" } },
      ];
    }

    if (validatedFilters.tags && validatedFilters.tags.length > 0) {
      where.tags = {
        array_contains: validatedFilters.tags,
      };
    }

    const db = prismaForOrg(user.organizationId);
    const [clients, totalCount] = await Promise.all([
      db.client.findMany({
        where,
        include: {
          creator: {
            select: { name: true, email: true },
          },
          interactions: {
            select: { id: true, timestamp: true },
            orderBy: { timestamp: "desc" },
            take: 1,
          },
          _count: {
            select: {
              interactions: true,
              notes: true,
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (validatedFilters.page - 1) * validatedFilters.limit,
        take: validatedFilters.limit,
      }),
      db.client.count({ where }),
    ]);

    return {
      clients,
      totalCount,
      page: validatedFilters.page,
      totalPages: Math.ceil(totalCount / validatedFilters.limit),
    };
  } catch (error) {
    console.error("Failed to get clients:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to load clients. Please try again."
    );
  }
}

// Get single client by ID
export async function getClient(id: string) {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const db = prismaForOrg(user.organizationId);
    const client = await db.client.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        creator: {
          select: { name: true, email: true },
        },
        interactions: {
          include: {
            property: {
              select: { 
                id: true,
                propertyType: true,
                address: { select: { city: true, region: true } },
              },
            },
            creator: { select: { name: true } },
          },
          orderBy: { timestamp: "desc" },
        },
        notes: {
          include: {
            creator: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        tasks: {
          include: {
            creator: { select: { name: true } },
            assignee: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Client not found or you don't have access."
      );
    }

    return client;
  } catch (error) {
    console.error("Failed to get client:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to load client. Please try again."
    );
  }
}

// Get all unique tags from organization clients
export async function getClientTags() {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const db = prismaForOrg(user.organizationId);
    const clients = await db.client.findMany({
      where: {
        organizationId: user.organizationId,
      },
      select: {
        tags: true,
      },
    });

    // Extract unique tags
    const tagSet = new Set<string>();
    clients.forEach(client => {
      if (Array.isArray(client.tags)) {
        (client.tags as unknown[]).forEach((tag) => {
          if (typeof tag === "string") tagSet.add(tag);
        });
      }
    });

    return Array.from(tagSet).sort();
  } catch (error) {
    console.error("Failed to get client tags:", error);
    return [];
  }
}