"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/db/supabase";
import { 
  CreateTaskGroupInput, 
  TaskGroupSchema,
  CreateTaskGroupSchema
} from "@/lib/types";
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createNotFoundResponse 
} from "@/lib/utils/response-utils";
import { safeDbOperation } from "@/lib/utils/db-utils";
import { TaskGroupModel } from "@/lib/utils/model-utils";
import { validateData } from "@/lib/utils/error-utils";
import { revalidatePath } from "next/cache";

/**
 * Create a new task group
 * @param data - Task group data
 * @returns Success response with task group or error response
 */
export async function createTaskGroup(data: CreateTaskGroupInput) {
  try {
    // Validate input data
    const validatedData = validateData(CreateTaskGroupSchema, data);
    
    const user = await getCurrentUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    const taskGroup = await safeDbOperation(async () => {
      // Get the highest position to place the new group at the end
      const highestPositionGroup = await db.taskGroup.findFirst({
        where: { userId: user.id },
        orderBy: { position: "desc" },
      });
      
      const position = highestPositionGroup ? highestPositionGroup.position + 1 : 0;
      
      // Create the task group
      const newTaskGroup = await db.taskGroup.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          emoji: validatedData.emoji,
          color: validatedData.color,
          position,
          userId: user.id,
        },
      });
      
      // Create activity log
      await db.activityLog.create({
        data: {
          action: "GROUP_CREATED",
          userId: user.id,
          details: `گروه "${validatedData.name}" ایجاد شد`,
        },
      });
      
      return TaskGroupSchema.parse(newTaskGroup);
    });
    
    revalidatePath("/dashboard");
    return createSuccessResponse({ taskGroup });
  } catch (error) {
    console.error("Error creating task group:", error);
    return createErrorResponse("خطا در ایجاد گروه وظایف");
  }
}

/**
 * Update an existing task group
 * @param id - Task group ID
 * @param data - Task group update data
 * @returns Success response with updated task group or error response
 */
export async function updateTaskGroup(id: string, data: Partial<CreateTaskGroupInput>) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    // Check if the task group belongs to the user
    const existingGroup = await TaskGroupModel.findByIdWithOwnership(id, user.id);
    
    if (!existingGroup) {
      return createNotFoundResponse("گروه وظایف");
    }
    
    const taskGroup = await safeDbOperation(async () => {
      // Update the task group
      const updatedTaskGroup = await db.taskGroup.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          emoji: data.emoji,
          color: data.color,
        },
      });
      
      // Create activity log
      await db.activityLog.create({
        data: {
          action: "GROUP_UPDATED",
          userId: user.id,
          details: `گروه "${updatedTaskGroup.name}" به‌روزرسانی شد`,
        },
      });
      
      return TaskGroupSchema.parse(updatedTaskGroup);
    });
    
    revalidatePath("/dashboard");
    return createSuccessResponse({ taskGroup });
  } catch (error) {
    console.error("Error updating task group:", error);
    return createErrorResponse("خطا در به‌روزرسانی گروه وظایف");
  }
}

/**
 * Update task group position
 * @param id - Task group ID
 * @param newPosition - New position value
 * @returns Success response or error response
 */
export async function updateTaskGroupPosition(id: string, newPosition: number) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    // Check if the task group belongs to the user
    const existingGroup = await TaskGroupModel.findByIdWithOwnership(id, user.id);
    
    if (!existingGroup) {
      return createNotFoundResponse("گروه وظایف");
    }
    
    await safeDbOperation(async () => {
      // Update the task group position
      await db.taskGroup.update({
        where: { id },
        data: { position: newPosition },
      });
    });
    
    revalidatePath("/dashboard");
    return createSuccessResponse({ success: true }, "موقعیت گروه با موفقیت به‌روزرسانی شد");
  } catch (error) {
    console.error("Error updating task group position:", error);
    return createErrorResponse("خطا در به‌روزرسانی موقعیت گروه");
  }
}

/**
 * Delete a task group
 * @param id - Task group ID
 * @returns Success response or error response
 */
export async function deleteTaskGroup(id: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    // Check if the task group belongs to the user
    const existingGroup = await TaskGroupModel.findByIdWithOwnership(id, user.id);
    
    if (!existingGroup) {
      return createNotFoundResponse("گروه وظایف");
    }
    
    await safeDbOperation(async () => {
      // Create activity log before deleting the group
      await db.activityLog.create({
        data: {
          action: "GROUP_UPDATED",
          userId: user.id,
          details: `گروه "${existingGroup.name}" حذف شد`,
        },
      });
      
      // Delete the task group
      await db.taskGroup.delete({
        where: { id },
      });
    });
    
    revalidatePath("/dashboard");
    return createSuccessResponse({ success: true }, "گروه وظایف با موفقیت حذف شد");
  } catch (error) {
    console.error("Error deleting task group:", error);
    return createErrorResponse("خطا در حذف گروه وظایف");
  }
}