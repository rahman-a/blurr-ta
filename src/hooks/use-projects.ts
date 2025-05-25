import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project } from "@/types/project";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  CreateProjectData,
  UpdateProjectData,
} from "@/lib/actions/projects";

// Fetch all projects
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const result = await getProjects();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Project[];
    },
  });
}

// Fetch single project
export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const result = await getProject(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Project;
    },
    enabled: !!id,
  });
}

// Create project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const result = await createProject(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Update project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectData }) => {
      const result = await updateProject(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Project;
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", updatedProject.id] });
    },
  });
}

// Delete project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProject(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
