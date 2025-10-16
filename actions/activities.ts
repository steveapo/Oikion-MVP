"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { activityFiltersSchema, type ActivityFilters } from "@/lib/validations/activity";

// Get activities with filters
export async function getActivities(filters: Partial<ActivityFilters> = {}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  // Set default date range if none provided
  const defaultFilters = {
    ...filters,
    dateTo: filters.dateTo || new Date(),
    dateFrom: filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  };

  const validatedFilters = activityFiltersSchema.parse(defaultFilters);

  try {
    const where: any = {
      organizationId: session.user.organizationId,
      createdAt: {
        gte: validatedFilters.dateFrom,
        lte: validatedFilters.dateTo,
      },
    };

    // Apply filters
    if (validatedFilters.actorId) {
      where.actorId = validatedFilters.actorId;
    }
    if (validatedFilters.entityType) {
      where.entityType = validatedFilters.entityType;
    }
    if (validatedFilters.actionType) {
      where.actionType = validatedFilters.actionType;
    }

    const db = prismaForOrg(session.user.organizationId!);
    
    const [activities, totalCount] = await Promise.all([
      db.activity.findMany({
        where,
        include: {
          actor: {
            select: { 
              id: true, 
              name: true, 
              email: true 
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (validatedFilters.page - 1) * validatedFilters.limit,
        take: validatedFilters.limit,
      }),
      db.activity.count({ where }),
    ]);

    // Enrich activities with entity details
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        let entityDetails: Record<string, any> | null = null;

        try {
          switch (activity.entityType) {
            case "PROPERTY":
              entityDetails = await db.property.findUnique({
                where: { id: activity.entityId },
                select: {
                  id: true,
                  propertyType: true,
                  price: true,
                  address: { select: { city: true, region: true } },
                },
              });
              break;
            case "CLIENT":
              entityDetails = await db.client.findUnique({
                where: { id: activity.entityId },
                select: {
                  id: true,
                  name: true,
                  clientType: true,
                },
              });
              break;
            case "TASK":
              entityDetails = await db.task.findUnique({
                where: { id: activity.entityId },
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              });
              break;
            case "USER":
              // User table does not have organizationId RLS, use prisma directly
              entityDetails = await prisma.user.findUnique({
                where: { id: activity.entityId },
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              });
              break;
          }
        } catch (error) {
          // Entity might be deleted, keep activity but mark as deleted
          console.warn(`Entity ${activity.entityId} not found for activity ${activity.id}`);
        }

        return {
          ...activity,
          entityDetails,
        };
      })
    );

    return {
      activities: enrichedActivities,
      totalCount,
      page: validatedFilters.page,
      totalPages: Math.ceil(totalCount / validatedFilters.limit),
    };
  } catch (error) {
    console.error("Failed to get activities:", error);
    throw new Error("Failed to get activities");
  }
}

// Get organization members for actor filter
export async function getOrganizationActors() {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.organizationId) {
    throw new Error("Unauthorized");
  }

  try {
    const actors = await prisma.user.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return actors;
  } catch (error) {
    console.error("Failed to get organization actors:", error);
    return [];
  }
}