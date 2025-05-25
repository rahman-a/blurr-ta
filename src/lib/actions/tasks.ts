"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Task } from "@/types/project";

// Helper function to transform Prisma data to match Task type
function transformTask(task: {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  assignedToId: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
  };
}): Task {
  return {
    ...task,
    description: task.description || undefined,
    assignedToId: task.assignedToId || undefined,
    assignedTo: task.assignedTo || undefined,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  assignedToId: z.string().optional(),
  projectId: z.string().min(1, "Project ID is required"),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  assignedToId: z.string().optional(),
});

export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;

// Fetch tasks with optional filters
export async function getTasks(projectId?: string, status?: string) {
  try {
    const where: {
      projectId?: string;
      status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    } = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: tasks.map(transformTask) };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

// Fetch single task
export async function getTask(id: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    return { success: true, data: transformTask(task) };
  } catch (error) {
    console.error("Error fetching task:", error);
    return { success: false, error: "Failed to fetch task" };
  }
}

// Create task
export async function createTask(data: CreateTaskData) {
  try {
    const validatedData = createTaskSchema.parse(data);

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority || "MEDIUM",
        status: validatedData.status || "TODO",
        assignedToId: validatedData.assignedToId || null,
        projectId: validatedData.projectId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${validatedData.projectId}`);
    return { success: true, data: transformTask(task) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", details: error.errors };
    }

    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

// Update task
export async function updateTask(id: string, data: UpdateTaskData) {
  try {
    const validatedData = updateTaskSchema.parse(data);

    const updateData: {
      title?: string;
      description?: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
      assignedToId?: string | null;
    } = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.assignedToId !== undefined) updateData.assignedToId = validatedData.assignedToId || null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    return { success: true, data: transformTask(task) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", details: error.errors };
    }

    console.error("Error updating task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

// Delete task
export async function deleteTask(id: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.delete({
      where: { id },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    return { success: true, message: "Task deleted successfully" };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}
