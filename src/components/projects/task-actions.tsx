"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { TaskForm } from "./task-form";
import type { Task } from "@/types/project";

interface TaskActionsProps {
  task: Task;
  projectId: string;
  onDelete: (taskId: string) => void;
}

export function TaskActions({ task, projectId, onDelete }: TaskActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <TaskForm
            task={task}
            projectId={projectId}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <ConfirmationDialog
            title="Delete Task"
            description={`Are you sure you want to delete "${task.title}"?`}
            warningText="This action cannot be undone."
            confirmText="Delete Task"
            onConfirm={() => onDelete(task.id)}
          >
            <div className="text-red-600 flex items-center w-full cursor-pointer p-2">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </div>
          </ConfirmationDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
