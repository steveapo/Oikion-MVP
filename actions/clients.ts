"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg, withOrgContext } from "@/lib/org-prisma";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { 
  clientFormSchema, 
  updateClientSchema, 
  clientFiltersSchema,
  type ClientFormData,
  type ClientFilters 
} from "@/lib/validations/client";
import { ActionType, EntityType } from "@prisma/client";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { broadcastLiveUpdate } from "@/lib/live-updates";

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

// Broadcast client update helper
async function broadcastClientUpdate(
  action: "created" | "updated" | "deleted",
  clientId: string,
  organizationId: string
) {
  try {
    await broadcastLiveUpdate("client", clientId, {
      action,
      organizationId,
    });
  } catch (error) {
    console.error("Failed to broadcast client update:", error);
  }
}

// Create client action
export async function createClient(data: ClientFormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!canCreateContent(session.user.role)) {
    throw new Error("Insufficient permissions to create clients");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  const validatedData = clientFormSchema.parse(data);

  try {
    const db = prismaForOrg(session.user.organizationId);
    const client = await db.client.create({
      data: {
        clientType: validatedData.clientType,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        secondaryEmail: validatedData.secondaryEmail || null,
        secondaryPhone: validatedData.secondaryPhone || null,
        tags: validatedData.tags || [],
        organizationId: session.user.organizationId,
        createdBy: session.user.id,
      },
    });

    await createActivity(
      ActionType.CLIENT_CREATED,
      client.id,
      session.user.id,
      session.user.organizationId,
      {
        clientType: validatedData.clientType,
        name: validatedData.name,
      }
    );

    // Broadcast live update
    await broadcastClientUpdate("created", client.id, session.user.organizationId);

    revalidateTag("clients:list");
    revalidateTag("dashboard:overview");
    revalidateTag("activities:feed");
    return { success: true, clientId: client.id };
  } catch (error) {
    console.error("Failed to create client:", error);
    throw new Error("Failed to create client");
  }
}

// Update client action
export async function updateClient(id: string, data: Partial<ClientFormData>) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!canCreateContent(session.user.role)) {
    throw new Error("Insufficient permissions to update clients");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  const validatedData = updateClientSchema.parse({ ...data, id });

  try {
    const db = prismaForOrg(session.user.organizationId);
    const existingClient = await db.client.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingClient) {
      throw new Error("Client not found or access denied");
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
      session.user.id,
      session.user.organizationId,
      {
        updatedFields: Object.keys(data),
      }
    );

    // Broadcast live update
    await broadcastClientUpdate("updated", id, session.user.organizationId);

    revalidateTag("clients:list");
    revalidateTag(`clients:detail:${id}`);
    revalidateTag("dashboard:overview");
    revalidateTag("activities:feed");
    return { success: true };
  } catch (error) {
    console.error("Failed to update client:", error);
    throw new Error("Failed to update client");
  }
}

// Delete client action
export async function deleteClient(id: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  try {
    const db = prismaForOrg(session.user.organizationId);
    const client = await db.client.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!client) {
      throw new Error("Client not found or access denied");
    }

    const isOwner = client.createdBy === session.user.id;
    if (!canDeleteContent(session.user.role, isOwner)) {
      throw new Error("Insufficient permissions to delete this client");
    }

    await db.client.delete({
      where: { id },
    });

    // Broadcast live update
    await broadcastClientUpdate("deleted", id, session.user.organizationId);

    revalidateTag("clients:list");
    revalidateTag("dashboard:overview");
    revalidateTag("activities:feed");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete client:", error);
    throw new Error("Failed to delete client");
  }
}

// Get clients with filters
export async function getClients(filters: Partial<ClientFilters> = {}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  const validatedFilters = clientFiltersSchema.parse(filters);

  try {
    const where: any = {
      organizationId: session.user.organizationId,
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

    const cached = unstable_cache(
      async (orgId: string, whereInput: any, page: number, limit: number) => {
        const [list, count] = await Promise.all([
          prismaForOrg(orgId).client.findMany({
            where: whereInput,
        include: {
              creator: { select: { name: true, email: true } },
              interactions: { select: { id: true, timestamp: true }, orderBy: { timestamp: "desc" }, take: 1 },
              _count: { select: { interactions: true, notes: true, tasks: true } },
        },
        orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prismaForOrg(orgId).client.count({ where: whereInput }),
        ]);
        return { list, count };
      },
      ["clients:getClients"],
      { tags: ["clients:list"], revalidate: 120 }
    );

    const { list: clients, count: totalCount } = await cached(
      session.user.organizationId,
      where,
      validatedFilters.page,
      validatedFilters.limit,
    );

    return {
      clients,
      totalCount,
      page: validatedFilters.page,
      totalPages: Math.ceil(totalCount / validatedFilters.limit),
    };
  } catch (error) {
    console.error("Failed to get clients:", error);
    throw new Error("Failed to get clients");
  }
}

// Get single client by ID
export async function getClient(id: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  try {
    const db = prismaForOrg(session.user.organizationId);
    const client = await db.client.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
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
                price: true,
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
      throw new Error("Client not found or access denied");
    }

    // Serialize Decimal fields in property data for client components
    const serializedClient = {
      ...client,
      interactions: client.interactions.map(interaction => ({
        ...interaction,
        property: interaction.property ? {
          ...interaction.property,
          price: Number(interaction.property.price),
        } : null,
      })),
    };

    return serializedClient;
  } catch (error) {
    console.error("Failed to get client:", error);
    throw new Error("Failed to get client");
  }
}

// Get all unique tags from organization clients
export async function getClientTags() {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.organizationId) {
    throw new Error("Unauthorized");
  }

  try {
    const db = prismaForOrg(session.user.organizationId);
    const clients = await db.client.findMany({
      where: {
        organizationId: session.user.organizationId,
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