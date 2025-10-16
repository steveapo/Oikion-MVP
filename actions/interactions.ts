"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prismaForOrg } from "@/lib/org-prisma";
import { canCreateContent } from "@/lib/roles";
import { 
  interactionFormSchema,
  noteFormSchema,
  taskFormSchema,
  updateTaskSchema,
  type InteractionFormData,
  type NoteFormData,
  type TaskFormData 
} from "@/lib/validations";
import { ActionType, EntityType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Helper function to create activity log
async function createActivity(
  actionType: ActionType,
  entityType: EntityType,
  entityId: string,
  actorId: string,
  organizationId: string,
  payload?: any
) {
  try {
    await prismaForOrg(organizationId).activity.create({
      data: {
        actionType,
        entityType,
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

// Create interaction action
export async function createInteraction(data: InteractionFormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!canCreateContent(session.user.role)) {
    throw new Error("Insufficient permissions to create interactions");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  const validatedData = interactionFormSchema.parse(data);

  try {
    const db = prismaForOrg(session.user.organizationId);
    const interaction = await db.interaction.create({
      data: {
        interactionType: validatedData.interactionType,
        clientId: validatedData.clientId || null,
        propertyId: validatedData.propertyId || null,
        summary: validatedData.summary,
        timestamp: validatedData.timestamp,
        createdBy: session.user.id,
      },
    });

    // Get client name for activity log
    let clientName = "";
    if (validatedData.clientId) {
      const client = await prismaForOrg(session.user.organizationId).client.findUnique({
        where: { id: validatedData.clientId },
        select: { name: true },
      });
      clientName = client?.name || "";
    }

    await createActivity(
      ActionType.INTERACTION_LOGGED,
      EntityType.CLIENT,
      validatedData.clientId || interaction.id,
      session.user.id,
      session.user.organizationId,
      {
        interactionType: validatedData.interactionType,
        clientName,
        propertyId: validatedData.propertyId,
      }
    );

    revalidatePath("/dashboard/relations");
    if (validatedData.clientId) {
      revalidatePath(`/dashboard/relations/${validatedData.clientId}`);
    }
    
    return { success: true, interactionId: interaction.id };
  } catch (error) {
    console.error("Failed to create interaction:", error);
    throw new Error("Failed to create interaction");
  }
}

// Create note action
export async function createNote(data: NoteFormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!canCreateContent(session.user.role)) {
    throw new Error("Insufficient permissions to create notes");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  const validatedData = noteFormSchema.parse(data);

  try {
    const db = prismaForOrg(session.user.organizationId);
    const note = await db.note.create({
      data: {
        content: validatedData.content,
        clientId: validatedData.clientId || null,
        propertyId: validatedData.propertyId || null,
        createdBy: session.user.id,
      },
    });

    // Determine entity for activity log
    const entityType = validatedData.clientId ? EntityType.CLIENT : EntityType.PROPERTY;
    const entityId = validatedData.clientId || validatedData.propertyId!;

    await createActivity(
      ActionType.NOTE_ADDED,
      entityType,
      entityId,
      session.user.id,
      session.user.organizationId,
      {
        noteLength: validatedData.content.length,
      }
    );

    revalidatePath("/dashboard/relations");
    if (validatedData.clientId) {
      revalidatePath(`/dashboard/relations/${validatedData.clientId}`);
    }
    if (validatedData.propertyId) {
      revalidatePath(`/dashboard/properties/${validatedData.propertyId}`);
    }
    
    return { success: true, noteId: note.id };
  } catch (error) {
    console.error("Failed to create note:", error);
    throw new Error("Failed to create note");
  }
}

// Create task action
export async function createTask(data: TaskFormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!canCreateContent(session.user.role)) {
    throw new Error("Insufficient permissions to create tasks");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  const validatedData = taskFormSchema.parse(data);

  try {
    const db = prismaForOrg(session.user.organizationId);
    const task = await db.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        dueDate: validatedData.dueDate || null,
        status: validatedData.status,
        organizationId: session.user.organizationId,
        assignedTo: validatedData.assignedTo || null,
        clientId: validatedData.clientId || null,
        propertyId: validatedData.propertyId || null,
        createdBy: session.user.id,
      },
    });

    await createActivity(
      ActionType.TASK_CREATED,
      EntityType.TASK,
      task.id,
      session.user.id,
      session.user.organizationId,
      {
        taskTitle: validatedData.title,
        assignedTo: validatedData.assignedTo,
      }
    );

    revalidatePath("/dashboard/relations");
    if (validatedData.clientId) {
      revalidatePath(`/dashboard/relations/${validatedData.clientId}`);
    }
    
    return { success: true, taskId: task.id };
  } catch (error) {
    console.error("Failed to create task:", error);
    throw new Error("Failed to create task");
  }
}

// Update task status
export async function updateTaskStatus(id: string, status: "PENDING" | "COMPLETED" | "CANCELLED") {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!canCreateContent(session.user.role)) {
    throw new Error("Insufficient permissions to update tasks");
  }

  if (!session.user.organizationId) {
    throw new Error("User must belong to an organization");
  }

  try {
    const db = prismaForOrg(session.user.organizationId);
    const existingTask = await db.task.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingTask) {
      throw new Error("Task not found or access denied");
    }

    const task = await db.task.update({
      where: { id },
      data: { status },
    });

    if (status === "COMPLETED") {
      await createActivity(
        ActionType.TASK_COMPLETED,
        EntityType.TASK,
        task.id,
        session.user.id,
        session.user.organizationId,
        {
          taskTitle: existingTask.title,
        }
      );
    }

    revalidatePath("/dashboard/relations");
    if (existingTask.clientId) {
      revalidatePath(`/dashboard/relations/${existingTask.clientId}`);
    }
    if (existingTask.propertyId) {
      revalidatePath(`/dashboard/properties/${existingTask.propertyId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update task:", error);
    throw new Error("Failed to update task");
  }
}

// Get organization members for task assignment
export async function getOrganizationMembers() {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.organizationId) {
    throw new Error("Unauthorized");
  }

  try {
    const db = prismaForOrg(session.user.organizationId);
    const members = await db.user.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return members;
  } catch (error) {
    console.error("Failed to get organization members:", error);
    return [];
  }
}

// Get properties for interaction linking
export async function getOrganizationProperties() {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.organizationId) {
    throw new Error("Unauthorized");
  }

  try {
    const db = prismaForOrg(session.user.organizationId);
    const properties = await db.property.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        propertyType: true,
        price: true,
        address: {
          select: { city: true, region: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit for dropdown
    });

    // Serialize Decimal price to number for UI consumption
    const serialized = properties.map((p) => ({
      id: p.id,
      propertyType: p.propertyType,
      price: Number(p.price),
      address: p.address,
    }));

    return serialized;
  } catch (error) {
    console.error("Failed to get organization properties:", error);
    return [];
  }
}