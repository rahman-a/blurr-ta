"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Project } from "@/types/project";

// Helper function to transform Prisma data to match Project type
function transformProject(project: {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Array<{
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
  }>;
  _count?: {
    tasks: number;
  };
}): Project {
  return {
    ...project,
    description: project.description || undefined,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate ? project.endDate.toISOString() : undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    tasks: project.tasks?.map((task) => ({
      ...task,
      description: task.description || undefined,
      assignedToId: task.assignedToId || undefined,
      assignedTo: task.assignedTo || undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  };
}

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

// Fetch all projects
export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: projects.map(transformProject) };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}

// Fetch single project
export async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    return { success: true, data: transformProject(project) };
  } catch (error) {
    console.error("Error fetching project:", error);
    return { success: false, error: "Failed to fetch project" };
  }
}

// Create project
export async function createProject(data: CreateProjectData) {
  try {
    const validatedData = createProjectSchema.parse(data);

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status || "ACTIVE",
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, data: transformProject(project) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", details: error.errors };
    }

    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

// Update project
export async function updateProject(id: string, data: UpdateProjectData) {
  try {
    const validatedData = updateProjectSchema.parse(data);

    const updateData: {
      name?: string;
      description?: string;
      status?: "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
      startDate?: Date;
      endDate?: Date | null;
    } = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate !== undefined)
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id}`);
    return { success: true, data: transformProject(project) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", details: error.errors };
    }

    console.error("Error updating project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

// Delete project
export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}
