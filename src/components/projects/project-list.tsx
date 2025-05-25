"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import { Project } from "@/types/project";
import { useDeleteProject } from "@/hooks/use-projects";
import { ProjectForm } from "./project-form";
import { ProjectActions } from "./project-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

interface ProjectListProps {
  projects: Project[];
}

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function ProjectList({ projects }: ProjectListProps) {
  const deleteProject = useDeleteProject();

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast.success("Project deleted successfully");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
        <p className="text-sm text-muted-foreground mb-4">Get started by creating your first project</p>
        <ProjectForm />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg line-clamp-1">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="hover:underline"
                  >
                    {project.name}
                  </Link>
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={statusColors[project.status]}
                >
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              <ProjectActions
                project={project}
                onDelete={handleDeleteProject}
              />
            </div>
          </CardHeader>
          <CardContent>
            {project.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
            )}

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Started {format(new Date(project.startDate), "MMM dd, yyyy")}</span>
              </div>

              {project.endDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Ends {format(new Date(project.endDate), "MMM dd, yyyy")}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>{project._count?.tasks || 0} tasks</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link href={`/dashboard/projects/${project.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
