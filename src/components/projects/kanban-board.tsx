"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Task, TaskStatus } from "@/types/project";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { TaskActions } from "./task-actions";
import { toast } from "sonner";

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
}

const statusColumns: { status: TaskStatus; title: string; color: string }[] = [
  { status: "TODO", title: "To Do", color: "bg-gray-100" },
  { status: "IN_PROGRESS", title: "In Progress", color: "bg-blue-100" },
  { status: "IN_REVIEW", title: "In Review", color: "bg-yellow-100" },
  { status: "DONE", title: "Done", color: "bg-green-100" },
];

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask.mutateAsync({ id: taskId, data: { status: newStatus } });
      toast.success("Task status updated");
    } catch {
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
          <TaskActions
            task={task}
            projectId={projectId}
            onDelete={handleDeleteTask}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>}

        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`text-xs ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </Badge>

          {task.assignedTo ? (
            <div className="flex items-center space-x-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">
                  {task.assignedTo.firstName[0]}
                  {task.assignedTo.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignedTo.firstName}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-xs">Unassigned</span>
            </div>
          )}
        </div>

        {/* Status change buttons */}
        <div className="mt-3 flex flex-wrap gap-1">
          {statusColumns
            .filter((col) => col.status !== task.status)
            .map((col) => (
              <Button
                key={col.status}
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => handleStatusChange(task.id, col.status)}
              >
                Move to {col.title}
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusColumns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);

        return (
          <div
            key={column.status}
            className="space-y-4"
          >
            <div className={`rounded-lg p-4 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  {columnTasks.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
