"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/db/supabase";
import {
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubTaskInput,
  TaskSchema,
  SubTaskSchema,
  UpdateSubTaskInput,
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateSubTaskSchema,
  UpdateSubTaskSchema
} from "@/lib/types";
import {
  createErrorResponse,
  createSuccessResponse,
  createUnauthorizedResponse,
  createNotFoundResponse
} from "@/lib/utils/response-utils";
import { safeDbOperation } from "@/lib/utils/db-utils";
import { TaskModel } from "@/lib/utils/model-utils";
import { revalidatePath } from "next/cache";
import { validateData } from "@/lib/utils/error-utils";

/**
 * Create a new task
 * @param data - Task data
 * @returns Success response with task or error response
 */
export async function createTask(data: CreateTaskInput) {
  try {
    // Validate input data
    const validatedData = validateData(CreateTaskSchema, data) as CreateTaskInput;

    const user = await getCurrentUser();

    if (!user) {
      return createUnauthorizedResponse();
    }

    const task = await safeDbOperation(async () => {
      // Create the task
      const newTask = await db.task.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          priority: validatedData.priority,
          dueDate: validatedData.dueDate,
          userId: user.id,
          taskGroupId: validatedData.taskGroupId,
        },
      });

      // Create activity log
      await db.activityLog.create({
        data: {
          action: "TASK_CREATED",
          userId: user.id,
          taskId: newTask.id,
        },
      });

      return TaskSchema.parse(newTask);
    });

    revalidatePath("/dashboard");
    return createSuccessResponse({ task });
  } catch (error) {
    console.error("Error creating task:", error);
    return createErrorResponse("خطا در ایجاد وظیفه");
  }
}

/**
 * Update an existing task
 * @param data - Task update data
 * @returns Success response with updated task or error response
 */
export async function updateTask(data: UpdateTaskInput) {
  try {
    // Validate input data
    const validatedData = validateData(UpdateTaskSchema, data) as UpdateTaskInput;

    const user = await getCurrentUser();

    if (!user) {
      return createUnauthorizedResponse();
    }

    // Check if the task belongs to the user
    const existingTask = await TaskModel.findByIdWithOwnership(validatedData.id, user.id);

    if (!existingTask) {
      return createNotFoundResponse("وظیفه");
    }

    const task = await safeDbOperation(async () => {
      // Update the task
      const updatedTask = await db.task.update({
        where: { id: validatedData.id },
        data: {
          title: validatedData.title,
          description: validatedData.description,
          priority: validatedData.priority,
          status: validatedData.status,
          dueDate: validatedData.dueDate,
          importanceScore: validatedData.importanceScore,
          urgencyScore: validatedData.urgencyScore,
          taskGroupId: validatedData.taskGroupId,
        },
      });

      // Create activity log
      await db.activityLog.create({
        data: {
          action: "TASK_UPDATED",
          userId: user.id,
          taskId: updatedTask.id,
        },
      });

      return TaskSchema.parse(updatedTask);
    });

    revalidatePath("/dashboard");
    return createSuccessResponse({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return createErrorResponse("خطا در به‌روزرسانی وظیفه");
  }
}

/**
 * Delete a task
 * @param id - Task ID
 * @returns Success response or error response
 */
export async function deleteTask(id: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return createUnauthorizedResponse();
    }

    // Check if the task belongs to the user
    const existingTask = await TaskModel.findByIdWithOwnership(id, user.id);

    if (!existingTask) {
      return createNotFoundResponse("وظیفه");
    }

    await safeDbOperation(async () => {
      // Create activity log before deleting the task
      await db.activityLog.create({
        data: {
          action: "TASK_DELETED",
          userId: user.id,
          details: `وظیفه "${existingTask.title}" حذف شد`,
        },
      });

      // Delete the task
      await db.task.delete({
        where: { id },
      });
    });

    revalidatePath("/dashboard");
    return createSuccessResponse({ success: true }, "وظیفه با موفقیت حذف شد");
  } catch (error) {
    console.error("Error deleting task:", error);
    return createErrorResponse("خطا در حذف وظیفه");
  }
}

/**
 * Create a new subtask
 * @param data - Subtask data
 * @returns Success response with subtask or error response
 */
export async function createSubTask(data: CreateSubTaskInput) {
  try {
    // Validate input data
    const validatedData = validateData(CreateSubTaskSchema, data) as CreateSubTaskInput;

    const user = await getCurrentUser();

    if (!user) {
      return createUnauthorizedResponse();
    }

    // Check if the parent task belongs to the user
    const existingTask = await TaskModel.findByIdWithOwnership(validatedData.taskId, user.id);

    if (!existingTask) {
      return createNotFoundResponse("وظیفه");
    }

    const subTask = await safeDbOperation(async () => {
      // Create the subtask
      const newSubTask = await db.subTask.create({
        data: {
          title: validatedData.title,
          taskId: validatedData.taskId,
        },
      });

      // Create activity log
      await db.activityLog.create({
        data: {
          action: "SUBTASK_ADDED",
          userId: user.id,
          taskId: validatedData.taskId,
        },
      });

      return SubTaskSchema.parse(newSubTask);
    });

    revalidatePath("/dashboard");
    return createSuccessResponse({ subTask });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return createErrorResponse("خطا در ایجاد زیر-وظیفه");
  }
}

/**
 * Update a subtask
 * @param data - Subtask update data
 * @returns Success response with updated subtask or error response
 */
export async function updateSubTask(data: UpdateSubTaskInput) {
  try {
    // Validate input data
    const validatedData = validateData(UpdateSubTaskSchema, data) as UpdateSubTaskInput;

    const user = await getCurrentUser();

    if (!user) {
      return createUnauthorizedResponse();
    }

    // Find the subtask and check ownership through the parent task
    const subTask = await db.subTask.findUnique({
      where: { id: validatedData.id },
      include: { task: true },
    });

    if (!subTask || subTask.task.userId !== user.id) {
      return createNotFoundResponse("زیر-وظیفه");
    }

    const updatedSubTask = await safeDbOperation(async () => {
      // Update the subtask
      const updated = await db.subTask.update({
        where: { id: validatedData.id },
        data: {
          title: validatedData.title,
          completed: validatedData.completed,
          position: validatedData.position,
        },
      });

      // If subtask was completed, create activity log
      if (validatedData.completed === true && !subTask.completed) {
        await db.activityLog.create({
          data: {
            action: "SUBTASK_COMPLETED",
            userId: user.id,
            taskId: subTask.taskId,
          },
        });
      }

      return SubTaskSchema.parse(updated);
    });

    revalidatePath("/dashboard");
    return createSuccessResponse({ subTask: updatedSubTask });
  } catch (error) {
    console.error("Error updating subtask:", error);
    return createErrorResponse("خطا در به‌روزرسانی زیر-وظیفه");
  }
}

/**
 * Delete a subtask
 * @param id - Subtask ID
 * @returns Success response or error response
 */
export async function deleteSubTask(id: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return createUnauthorizedResponse();
    }

    // Find the subtask and check ownership through the parent task
    const subTask = await db.subTask.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!subTask || subTask.task.userId !== user.id) {
      return createNotFoundResponse("زیر-وظیفه");
    }

    await safeDbOperation(async () => {
      // Delete the subtask
      await db.subTask.delete({
        where: { id },
      });
    });

    revalidatePath("/dashboard");
    return createSuccessResponse({ success: true }, "زیر-وظیفه با موفقیت حذف شد");
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return createErrorResponse("خطا در حذف زیر-وظیفه");
  }
}