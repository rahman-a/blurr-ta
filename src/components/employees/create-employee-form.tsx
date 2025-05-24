"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { createEmployeeSchema, type CreateEmployeeFormData } from "@/lib/validations";
import { useDepartmentsAndPositions } from "@/hooks/use-employees";
import { useCreateEmployee } from "@/hooks/use-employee-mutations";

// Import the new section components
import { PersonalInfoSection } from "./personal-info-section";
import { EmploymentDetailsSection } from "./employment-details-section";
import { SalaryDetailsSection } from "./salary-details-section";

interface CreateEmployeeFormProps {
  onSuccess?: () => void;
}

type Position = {
  id: string;
  title: string;
  departmentId: string;
  department: { name: string };
  _count: { employees: number };
};

export function CreateEmployeeForm({ onSuccess }: CreateEmployeeFormProps) {
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);

  const form = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      hireDate: new Date(),
      departmentId: "",
      positionId: "",
      isActive: true,

      // Salary defaults
      salary: {
        basicSalary: 0,
        grossSalary: 0,
        netSalary: 0,
        currency: "USD",
        salaryType: "MONTHLY" as const,
        effectiveDate: new Date(),
      },
    },
  });

  const watchedDepartmentId = form.watch("departmentId");

  // Use the new combined hook for parallel fetching
  const { departments, positions, isLoading, isDepartmentsLoading, isPositionsLoading, hasError } =
    useDepartmentsAndPositions();

  const createEmployeeMutation = useCreateEmployee();

  // Filter positions based on selected department
  useEffect(() => {
    if (watchedDepartmentId) {
      const filtered = positions.filter((position) => position.departmentId === watchedDepartmentId);
      setFilteredPositions(filtered);
      // Reset position selection if current position doesn't belong to new department
      const currentPositionId = form.getValues("positionId");
      if (currentPositionId && !filtered.some((p) => p.id === currentPositionId)) {
        form.setValue("positionId", "");
      }
    } else {
      setFilteredPositions([]);
      form.setValue("positionId", "");
    }
  }, [watchedDepartmentId, positions, form]);

  async function onSubmit(data: CreateEmployeeFormData) {
    createEmployeeMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.success) {
          form.reset();
          onSuccess?.();
        }
      },
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading form data...</span>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>Failed to load form data. Please refresh the page and try again.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Employee</CardTitle>
        <CardDescription>Add a new employee to your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Personal Information Section */}
            <PersonalInfoSection control={form.control} />

            <Separator />

            {/* Employment Details Section */}
            <EmploymentDetailsSection
              control={form.control}
              departments={departments}
              filteredPositions={filteredPositions}
              isDepartmentsLoading={isDepartmentsLoading}
              isPositionsLoading={isPositionsLoading}
            />

            <Separator />

            {/* Salary Details Section */}
            <SalaryDetailsSection control={form.control} />

            <Separator />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={createEmployeeMutation.isPending}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={createEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Employee
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
