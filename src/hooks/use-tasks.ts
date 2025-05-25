import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, TaskStatus } from "@/types/project";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  CreateTaskData,
  UpdateTaskData,
} from "@/lib/actions/tasks";

// Fetch all tasks with optional filters
export function useTasks(projectId?: string, status?: TaskStatus) {
  return useQuery({
    queryKey: ["tasks", projectId, status],
    queryFn: async () => {
      const result = await getTasks(projectId, status);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Task[];
    },
  });
}

// Fetch single task
export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const result = await getTask(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Task;
    },
    enabled: !!id,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const result = await createTask(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Task;
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects", newTask.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskData }) => {
      const result = await updateTask(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as Task;
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", updatedTask.id] });
      queryClient.invalidateQueries({ queryKey: ["projects", updatedTask.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTask(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
