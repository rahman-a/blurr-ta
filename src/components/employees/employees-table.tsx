import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeActions } from "@/components/employees/employee-actions";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  hireDate: Date;
  isActive: boolean;
  department: {
    id: string;
    name: string;
  };
  position: {
    id: string;
    title: string;
  };
  salaries: Array<{
    id: string;
    basicSalary: number;
    currency: string;
    salaryType: "HOURLY" | "MONTHLY" | "YEARLY";
  }>;
}

interface EmployeesTableProps {
  employees: Employee[];
  isLoading: boolean;
  totalCount: number;
}

export function EmployeesTable({ employees, isLoading, totalCount }: EmployeesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Loading employees...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-12 w-full"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No employees found</h3>
          <p className="text-muted-foreground text-center mb-4">Get started by creating your first employee.</p>
          <Button asChild>
            <Link href="/dashboard/employees/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Employee
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Directory</CardTitle>
        <CardDescription>Manage your organization&apos;s employees ({totalCount} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Position</TableHead>
                <TableHead className="hidden lg:table-cell">Department</TableHead>
                <TableHead className="hidden sm:table-cell">Hire Date</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const currentSalary = employee.salaries?.[0];
                const employeeName = `${employee.firstName} ${employee.lastName}`;

                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm sm:text-base">{employeeName}</div>
                        <div className="sm:hidden text-xs text-muted-foreground mt-1">{employee.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{employee.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{employee.position.title}</TableCell>
                    <TableCell className="hidden lg:table-cell">{employee.department.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(employee.hireDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {currentSalary ? (
                        <span className="text-sm">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: currentSalary.currency,
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(currentSalary.basicSalary)}
                          <span className="text-muted-foreground ml-1">/{currentSalary.salaryType.toLowerCase()}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">No salary</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={employee.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <EmployeeActions
                        employeeId={employee.id}
                        employeeName={employeeName}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
