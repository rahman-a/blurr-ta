import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEmployee,
  updateEmployee,
  createCompensation,
  updateSalaryWithCompensations,
} from "@/lib/actions/employee";
import { toast } from "sonner";
import type { UpdateEmployeeFormData } from "@/lib/validations";

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch employees list
        queryClient.invalidateQueries({ queryKey: ["employees"] });

        // Invalidate department data to update employee counts
        queryClient.invalidateQueries({ queryKey: ["departments"] });

        // Invalidate position data to update employee counts
        queryClient.invalidateQueries({ queryKey: ["positions"] });

        toast.success(result.message || "Employee created successfully");
      } else {
        toast.error(result.error || "Failed to create employee");
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeFormData }) => updateEmployee(id, data),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch employees list
        queryClient.invalidateQueries({ queryKey: ["employees"] });

        // Invalidate specific employee data
        queryClient.invalidateQueries({ queryKey: ["employee"] });

        // Invalidate department data to update employee counts
        queryClient.invalidateQueries({ queryKey: ["departments"] });

        // Invalidate position data to update employee counts
        queryClient.invalidateQueries({ queryKey: ["positions"] });

        toast.success(result.message || "Employee updated successfully");
      } else {
        toast.error(result.error || "Failed to update employee");
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred");
    },
  });
}

export function useCreateCompensation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompensation,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch compensations
        queryClient.invalidateQueries({ queryKey: ["compensations"] });

        toast.success(result.message || "Compensation created successfully");
      } else {
        toast.error(result.error || "Failed to create compensation");
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred");
    },
  });
}

export function useUpdateSalaryWithCompensations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      salaryData,
      compensationIds,
    }: {
      employeeId: string;
      salaryData: {
        basicSalary: number;
        currency: string;
        salaryType: "HOURLY" | "MONTHLY" | "YEARLY";
        effectiveDate: Date;
      };
      compensationIds: string[];
    }) => updateSalaryWithCompensations(employeeId, salaryData, compensationIds),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch employees list
        queryClient.invalidateQueries({ queryKey: ["employees"] });

        // Invalidate specific employee data
        queryClient.invalidateQueries({ queryKey: ["employee"] });

        toast.success(result.message || "Salary updated successfully");
      } else {
        toast.error(result.error || "Failed to update salary");
      }
    },
    onError: () => {
      toast.error("An unexpected error occurred");
    },
  });
}
