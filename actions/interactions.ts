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
export async function createInteraction(
  data: InteractionFormData
): Promise<ActionResponse<{ interactionId: string }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to create interactions."
    );
  }

  // Validation
  const result = interactionFormSchema.safeParse(data);
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
    const interaction = await db.interaction.create({
      data: {
        interactionType: validatedData.interactionType,
        clientId: validatedData.clientId || null,
        propertyId: validatedData.propertyId || null,
        summary: validatedData.summary,
        timestamp: validatedData.timestamp,
        createdBy: user.id,
      },
    });

    // Get client name for activity log
    let clientName = "";
    if (validatedData.clientId) {
      const client = await db.client.findUnique({
        where: { id: validatedData.clientId },
        select: { name: true },
      });
      clientName = client?.name || "";
    }

    await createActivity(
      ActionType.INTERACTION_LOGGED,
      EntityType.CLIENT,
      validatedData.clientId || interaction.id,
      user.id,
      user.organizationId,
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
    
    return createSuccessResponse({ interactionId: interaction.id });
  } catch (error) {
    console.error("Failed to create interaction:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to create interaction. Please try again."
    );
  }
}

// Create note action
export async function createNote(
  data: NoteFormData
): Promise<ActionResponse<{ noteId: string }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to create notes."
    );
  }

  // Validation
  const result = noteFormSchema.safeParse(data);
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
    const note = await db.note.create({
      data: {
        content: validatedData.content,
        clientId: validatedData.clientId || null,
        propertyId: validatedData.propertyId || null,
        createdBy: user.id,
      },
    });

    // Determine entity for activity log
    const entityType = validatedData.clientId ? EntityType.CLIENT : EntityType.PROPERTY;
    const entityId = validatedData.clientId || validatedData.propertyId!;

    await createActivity(
      ActionType.NOTE_ADDED,
      entityType,
      entityId,
      user.id,
      user.organizationId,
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
    
    return createSuccessResponse({ noteId: note.id });
  } catch (error) {
    console.error("Failed to create note:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to create note. Please try again."
    );
  }
}

// Create task action
export async function createTask(
  data: TaskFormData
): Promise<ActionResponse<{ taskId: string }>> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to create tasks."
    );
  }

  // Validation
  const result = taskFormSchema.safeParse(data);
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
    const task = await db.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        dueDate: validatedData.dueDate || null,
        status: validatedData.status,
        organizationId: user.organizationId,
        assignedTo: validatedData.assignedTo || null,
        clientId: validatedData.clientId || null,
        propertyId: validatedData.propertyId || null,
        createdBy: user.id,
      },
    });

    await createActivity(
      ActionType.TASK_CREATED,
      EntityType.TASK,
      task.id,
      user.id,
      user.organizationId,
      {
        taskTitle: validatedData.title,
        assignedTo: validatedData.assignedTo,
      }
    );

    revalidatePath("/dashboard/relations");
    if (validatedData.clientId) {
      revalidatePath(`/dashboard/relations/${validatedData.clientId}`);
    }
    
    return createSuccessResponse({ taskId: task.id });
  } catch (error) {
    console.error("Failed to create task:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to create task. Please try again."
    );
  }
}

// Update task status
export async function updateTaskStatus(
  id: string, 
  status: "PENDING" | "COMPLETED" | "CANCELLED"
): Promise<ActionResponse> {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  // Permission check
  if (!canCreateContent(user.role)) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      "You don't have permission to update tasks."
    );
  }

  try {
    const db = prismaForOrg(user.organizationId);
    const existingTask = await db.task.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!existingTask) {
      return createErrorResponse(
        ErrorCode.NOT_FOUND,
        "Task not found or you don't have access."
      );
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
        user.id,
        user.organizationId,
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
    
    return createSuccessResponse();
  } catch (error) {
    console.error("Failed to update task:", error);
    return createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to update task. Please try again."
    );
  }
}

// Get organization members for task assignment
export async function getOrganizationMembers() {
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const db = prismaForOrg(user.organizationId);
    const members = await db.user.findMany({
      where: {
        organizationId: user.organizationId,
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
  // Authentication
  const authResult = await requireAuth();
  if (!authResult.success) return authResult.error;
  const { user } = authResult;

  try {
    const db = prismaForOrg(user.organizationId);
    const properties = await db.property.findMany({
      where: {
        organizationId: user.organizationId,
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