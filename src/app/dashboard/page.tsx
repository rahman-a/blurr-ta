import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { Users, Building2, FolderOpen, CheckSquare, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

async function getDashboardData() {
  try {
    // Get employee statistics
    const [totalEmployees, activeEmployees] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { isActive: true } }),
    ]);

    // Get project statistics
    const [totalProjects, activeProjects] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
    ]);

    // Get task statistics
    const [totalTasks, pendingTasks, completedTasks] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] } } }),
      prisma.task.count({ where: { status: "DONE" } }),
    ]);

    // Get department count
    const totalDepartments = await prisma.department.count();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentEmployees, recentProjects, recentTasks] = await Promise.all([
      prisma.employee.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true, firstName: true, lastName: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.project.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.task.findMany({
        where: {
          OR: [{ createdAt: { gte: sevenDaysAgo } }, { updatedAt: { gte: sevenDaysAgo }, status: "DONE" }],
        },
        select: { id: true, title: true, status: true, createdAt: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
    ]);

    return {
      stats: {
        totalEmployees,
        activeEmployees,
        totalProjects,
        activeProjects,
        totalTasks,
        pendingTasks,
        completedTasks,
        totalDepartments,
      },
      recentActivity: {
        employees: recentEmployees,
        projects: recentProjects,
        tasks: recentTasks,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      stats: {
        totalEmployees: 0,
        activeEmployees: 0,
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        totalDepartments: 0,
      },
      recentActivity: {
        employees: [],
        projects: [],
        tasks: [],
      },
    };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const { stats, recentActivity } = await getDashboardData();

  const allRecentActivities = [
    ...recentActivity.employees.map((emp) => ({
      type: "employee" as const,
      description: `New employee: ${emp.firstName} ${emp.lastName}`,
      date: emp.createdAt,
    })),
    ...recentActivity.projects.map((project) => ({
      type: "project" as const,
      description: `New project: ${project.name}`,
      date: project.createdAt,
    })),
    ...recentActivity.tasks.map((task) => ({
      type: "task" as const,
      description: `Task ${task.status === "DONE" ? "completed" : "created"}: ${task.title}`,
      date: task.status === "DONE" ? task.updatedAt : task.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name || "User"}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">{stats.activeEmployees} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">{stats.activeProjects} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingTasks} pending, {stats.completedTasks} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Task Progress
            </CardTitle>
            <CardDescription>Current task completion status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed</span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {stats.completedTasks}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">In Progress</span>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800"
              >
                {stats.pendingTasks}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Completion Rate</span>
              <span className="text-sm font-medium">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {allRecentActivities.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {allRecentActivities.map((activity, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-start"
                  >
                    <span className="flex-1">{activity.description}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {format(new Date(activity.date), "MMM dd")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>System overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Projects</span>
              <Badge variant={stats.activeProjects > 0 ? "default" : "secondary"}>{stats.activeProjects}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Employees</span>
              <Badge variant={stats.activeEmployees > 0 ? "default" : "secondary"}>{stats.activeEmployees}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending Tasks</span>
              <Badge variant={stats.pendingTasks > 0 ? "destructive" : "secondary"}>{stats.pendingTasks}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
