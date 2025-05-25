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
import { ProjectForm } from "./project-form";
import type { Project } from "@/types/project";

interface ProjectActionsProps {
  project: Project;
  onDelete: (projectId: string) => void;
}

export function ProjectActions({ project, onDelete }: ProjectActionsProps) {
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
          <ProjectForm project={project} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <ConfirmationDialog
            title="Delete Project"
            description={`Are you sure you want to delete "${project.name}"?`}
            warningText="This action cannot be undone and will also delete all associated tasks."
            confirmText="Delete Project"
            onConfirm={() => onDelete(project.id)}
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
