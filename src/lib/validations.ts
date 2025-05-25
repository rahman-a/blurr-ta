import { z } from "zod";

export const createEmployeeSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  hireDate: z.date({
    required_error: "Please select a hire date",
  }),
  departmentId: z.string().min(1, "Please select a department"),
  positionId: z.string().min(1, "Please select a position"),
  isActive: z.boolean(),

  // Salary Details
  salary: z.object({
    basicSalary: z.number().min(1, "Basic salary must be a positive number"),
    grossSalary: z.number().min(1, "Gross salary must be a positive number"),
    netSalary: z.number().min(1, "Net salary must be a positive number"),
    currency: z.string().min(1, "Please select a currency"),
    salaryType: z.enum(["HOURLY", "MONTHLY", "YEARLY"]),
    effectiveDate: z.date({
      required_error: "Please select an effective date",
    }),
  }),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

export const compensationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  amount: z.number().min(0, "Amount must be a positive number"),
  description: z.string().optional(),
  type: z.enum(["ALLOWANCE", "BONUS", "DEDUCTION"]),
  isPercentage: z.boolean(),
});

export type CompensationFormData = z.infer<typeof compensationSchema>;

export const salaryWithCompensationsSchema = z.object({
  basicSalary: z.number().min(1, "Basic salary must be a positive number"),
  currency: z.string().min(1, "Please select a currency"),
  salaryType: z.enum(["HOURLY", "MONTHLY", "YEARLY"]),
  effectiveDate: z.date({
    required_error: "Please select an effective date",
  }),
  compensationIds: z.array(z.string()).optional(),
});

export type SalaryWithCompensationsFormData = z.infer<typeof salaryWithCompensationsSchema>;
