"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { ProjectForm } from "@/components/projects/project-form";
import { TaskForm } from "@/components/projects/task-form";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { BacklogTable } from "@/components/projects/backlog-table";
import { format } from "date-fns";
import Link from "next/link";

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function ProjectDetailContent() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">Failed to load project. Please try again.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/projects">
          <Button
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge
              variant="secondary"
              className={statusColors[project.status]}
            >
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
        </div>
        <div className="flex space-x-2">
          <TaskForm projectId={projectId} />
          <ProjectForm project={project} />
        </div>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">{format(new Date(project.startDate), "MMM dd, yyyy")}</p>
              </div>
            </div>

            {project.endDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(project.endDate), "MMM dd, yyyy")}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Tasks</p>
                <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Tabs
        defaultValue="kanban"
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
        </TabsList>

        <TabsContent
          value="kanban"
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Kanban Board</h2>
            <TaskForm projectId={projectId} />
          </div>
          {tasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Skeleton
                          key={j}
                          className="h-20 w-full"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              projectId={projectId}
            />
          )}
        </TabsContent>

        <TabsContent
          value="backlog"
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Task Backlog</h2>
            <TaskForm projectId={projectId} />
          </div>
          {tasksLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-12 w-full"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <BacklogTable
              tasks={tasks}
              projectId={projectId}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectDetailContent />
    </Suspense>
  );
}
