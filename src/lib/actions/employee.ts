"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createEmployeeSchema, type CreateEmployeeFormData } from "@/lib/validations";
import { Prisma } from "@prisma/client";

interface FilterCondition {
  attribute: string;
  operation: string;
  value: string;
}

export async function createEmployee(data: CreateEmployeeFormData) {
  try {
    // Validate the input data
    const validatedData = createEmployeeSchema.parse(data);

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmployee) {
      return {
        success: false,
        error: "An employee with this email already exists",
      };
    }

    // Create the employee and salary in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the employee
      const employee = await tx.employee.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone || null,
          hireDate: validatedData.hireDate,
          departmentId: validatedData.departmentId,
          positionId: validatedData.positionId,
          isActive: validatedData.isActive,
        },
        include: {
          department: true,
          position: true,
        },
      });

      // Create the salary record
      const salary = await tx.salary.create({
        data: {
          employeeId: employee.id,
          basicSalary: validatedData.salary.basicSalary,
          grossSalary: validatedData.salary.grossSalary,
          netSalary: validatedData.salary.netSalary,
          currency: validatedData.salary.currency,
          salaryType: validatedData.salary.salaryType,
          effectiveDate: validatedData.salary.effectiveDate,
          isActive: true,
        },
      });

      return { employee, salary };
    });

    revalidatePath("/dashboard/employees");

    return {
      success: true,
      employee: result.employee,
      salary: result.salary,
      message: "Employee and salary created successfully",
    };
  } catch (error) {
    console.error("Error creating employee:", error);
    return {
      success: false,
      error: "Failed to create employee. Please try again.",
    };
  }
}

export async function getDepartments() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
    return departments;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function getPositions(departmentId?: string) {
  try {
    const where = departmentId ? { departmentId } : {};
    const positions = await prisma.position.findMany({
      where,
      orderBy: { title: "asc" },
      include: {
        department: true,
        _count: {
          select: { employees: true },
        },
      },
    });
    return positions;
  } catch (error) {
    console.error("Error fetching positions:", error);
    return [];
  }
}

export async function getEmployees(page: number = 1, pageSize: number = 10, filters?: FilterCondition[]) {
  try {
    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build where clause from filters
    let whereClause: Prisma.EmployeeWhereInput = {};

    if (filters && filters.length > 0) {
      const filterConditions: Prisma.EmployeeWhereInput[] = filters.map((filter) => {
        const { attribute, operation, value } = filter;

        // Handle special filter fields
        if (attribute === "name") {
          // Search across both firstName and lastName - handled in API route
          return {};
        } else if (attribute === "salary") {
          // Search in current active salary - handled in API route
          return {};
        } else if (attribute === "departmentName") {
          const condition = buildDepartmentFilterCondition("name", operation, value);
          return { department: condition };
        } else if (attribute === "positionTitle") {
          const condition = buildPositionFilterCondition("title", operation, value);
          return { position: condition };
        } else {
          return buildFilterCondition(attribute, operation, value);
        }
      });

      whereClause = { AND: filterConditions };
    }

    // Get total count for pagination
    const totalCount = await prisma.employee.count({
      where: whereClause,
    });

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        department: true,
        position: true,
        salaries: {
          where: { isActive: true },
          orderBy: { effectiveDate: "desc" },
          take: 1,
        },
      },
      orderBy: [{ isActive: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
      skip,
      take: pageSize,
    });

    return {
      data: employees,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return {
      data: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize,
    };
  }
}

// Helper function to build filter conditions
function buildFilterCondition(field: string, operation: string, value: string): Prisma.EmployeeWhereInput {
  switch (operation) {
    case "equals":
      return { [field]: value };
    case "not_equals":
      return { NOT: { [field]: value } };
    case "contains":
      return { [field]: { contains: value, mode: "insensitive" } };
    case "not_contains":
      return { NOT: { [field]: { contains: value, mode: "insensitive" } } };
    case "starts_with":
      return { [field]: { startsWith: value, mode: "insensitive" } };
    case "ends_with":
      return { [field]: { endsWith: value, mode: "insensitive" } };
    case "greater_than":
      return { [field]: { gt: field.includes("Date") ? new Date(value) : Number(value) } };
    case "greater_than_equal":
      return { [field]: { gte: field.includes("Date") ? new Date(value) : Number(value) } };
    case "less_than":
      return { [field]: { lt: field.includes("Date") ? new Date(value) : Number(value) } };
    case "less_than_equal":
      return { [field]: { lte: field.includes("Date") ? new Date(value) : Number(value) } };
    case "is_empty":
      return { OR: [{ [field]: null }, { [field]: "" }] };
    case "is_not_empty":
      return { AND: [{ [field]: { not: null } }, { [field]: { not: "" } }] };
    default:
      return {};
  }
}

// Helper function for department filter conditions
function buildDepartmentFilterCondition(field: string, operation: string, value: string): Prisma.DepartmentWhereInput {
  switch (operation) {
    case "equals":
      return { [field]: value };
    case "not_equals":
      return { NOT: { [field]: value } };
    case "contains":
      return { [field]: { contains: value, mode: "insensitive" } };
    case "not_contains":
      return { NOT: { [field]: { contains: value, mode: "insensitive" } } };
    case "starts_with":
      return { [field]: { startsWith: value, mode: "insensitive" } };
    case "ends_with":
      return { [field]: { endsWith: value, mode: "insensitive" } };
    default:
      return {};
  }
}

// Helper function for position filter conditions
function buildPositionFilterCondition(field: string, operation: string, value: string): Prisma.PositionWhereInput {
  switch (operation) {
    case "equals":
      return { [field]: value };
    case "not_equals":
      return { NOT: { [field]: value } };
    case "contains":
      return { [field]: { contains: value, mode: "insensitive" } };
    case "not_contains":
      return { NOT: { [field]: { contains: value, mode: "insensitive" } } };
    case "starts_with":
      return { [field]: { startsWith: value, mode: "insensitive" } };
    case "ends_with":
      return { [field]: { endsWith: value, mode: "insensitive" } };
    default:
      return {};
  }
}

export async function getEmployeeById(id: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        salaries: {
          orderBy: { effectiveDate: "desc" },
          include: {
            compensations: true,
          },
        },
      },
    });

    if (!employee) {
      return null;
    }

    return employee;
  } catch (error) {
    console.error("Error fetching employee:", error);
    return null;
  }
}

export async function updateEmployee(id: string, data: CreateEmployeeFormData) {
  try {
    // Validate the input data
    const validatedData = createEmployeeSchema.parse(data);

    // Check if email already exists for a different employee
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        email: validatedData.email,
        NOT: { id },
      },
    });

    if (existingEmployee) {
      return {
        success: false,
        error: "An employee with this email already exists",
      };
    }

    // Update the employee and create new salary record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the employee
      const employee = await tx.employee.update({
        where: { id },
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone || null,
          hireDate: validatedData.hireDate,
          departmentId: validatedData.departmentId,
          positionId: validatedData.positionId,
          isActive: validatedData.isActive,
        },
        include: {
          department: true,
          position: true,
        },
      });

      // End the current active salary
      await tx.salary.updateMany({
        where: {
          employeeId: id,
          isActive: true,
        },
        data: {
          isActive: false,
          endDate: new Date(),
        },
      });

      // Create the new salary record
      const salary = await tx.salary.create({
        data: {
          employeeId: employee.id,
          basicSalary: validatedData.salary.basicSalary,
          grossSalary: validatedData.salary.grossSalary,
          netSalary: validatedData.salary.netSalary,
          currency: validatedData.salary.currency,
          salaryType: validatedData.salary.salaryType,
          effectiveDate: validatedData.salary.effectiveDate,
          isActive: true,
        },
      });

      return { employee, salary };
    });

    revalidatePath("/dashboard/employees");
    revalidatePath(`/dashboard/employees/${id}`);

    return {
      success: true,
      employee: result.employee,
      salary: result.salary,
      message: "Employee updated successfully",
    };
  } catch (error) {
    console.error("Error updating employee:", error);
    return {
      success: false,
      error: "Failed to update employee. Please try again.",
    };
  }
}

export async function getCompensations() {
  try {
    const compensations = await prisma.compensation.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return compensations;
  } catch (error) {
    console.error("Error fetching compensations:", error);
    return [];
  }
}

export async function createCompensation(data: {
  name: string;
  amount: number;
  description?: string;
  type: "ALLOWANCE" | "BONUS" | "DEDUCTION";
  isPercentage: boolean;
}) {
  try {
    const compensation = await prisma.compensation.create({
      data: {
        name: data.name,
        amount: data.amount,
        description: data.description,
        type: data.type,
        isPercentage: data.isPercentage,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/employees");

    return {
      success: true,
      compensation,
      message: "Compensation created successfully",
    };
  } catch (error) {
    console.error("Error creating compensation:", error);
    return {
      success: false,
      error: "Failed to create compensation. Please try again.",
    };
  }
}

export async function updateSalaryWithCompensations(
  employeeId: string,
  salaryData: {
    basicSalary: number;
    currency: string;
    salaryType: "HOURLY" | "MONTHLY" | "YEARLY";
    effectiveDate: Date;
  },
  compensationIds: string[],
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get compensations
      const compensations = await tx.compensation.findMany({
        where: {
          id: { in: compensationIds },
          isActive: true,
        },
      });

      // Calculate gross and net salary
      let grossSalary = salaryData.basicSalary;
      let netSalary = salaryData.basicSalary;

      compensations.forEach((comp) => {
        const amount = comp.isPercentage ? (comp.amount / 100) * salaryData.basicSalary : comp.amount;

        if (comp.type === "BONUS" || comp.type === "ALLOWANCE") {
          grossSalary += amount;
          netSalary += amount;
        } else if (comp.type === "DEDUCTION") {
          netSalary -= amount;
        }
      });

      // End current active salary
      await tx.salary.updateMany({
        where: {
          employeeId,
          isActive: true,
        },
        data: {
          isActive: false,
          endDate: new Date(),
        },
      });

      // Create new salary record
      const salary = await tx.salary.create({
        data: {
          employeeId,
          basicSalary: salaryData.basicSalary,
          grossSalary,
          netSalary,
          currency: salaryData.currency,
          salaryType: salaryData.salaryType,
          effectiveDate: salaryData.effectiveDate,
          isActive: true,
          compensations: {
            connect: compensationIds.map((id) => ({ id })),
          },
        },
        include: {
          compensations: true,
        },
      });

      return salary;
    });

    revalidatePath("/dashboard/employees");
    revalidatePath(`/dashboard/employees/${employeeId}`);

    return {
      success: true,
      salary: result,
      message: "Salary updated with compensations successfully",
    };
  } catch (error) {
    console.error("Error updating salary with compensations:", error);
    return {
      success: false,
      error: "Failed to update salary. Please try again.",
    };
  }
}

export async function getSalariesWithEmployees(month?: number, year?: number, page: number = 1, pageSize: number = 10) {
  "use server";

  try {
    let whereClause = {};

    if (month && year) {
      // Filter salaries that were active during the specified month/year
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
      const endDate = new Date(year, month, 0); // Last day of the month

      whereClause = {
        OR: [
          // Salary started before/during the month and hasn't ended
          {
            effectiveDate: { lte: endDate },
            OR: [{ endDate: null }, { endDate: { gte: startDate } }],
          },
        ],
      };
    } else {
      // If no month filter, get only active salaries
      whereClause = { isActive: true };
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.salary.count({
      where: whereClause,
    });

    const salaries = await prisma.salary.findMany({
      where: whereClause,
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
        compensations: true,
      },
      orderBy: [{ employee: { lastName: "asc" } }, { employee: { firstName: "asc" } }, { effectiveDate: "desc" }],
      skip,
      take: pageSize,
    });

    // If filtering by month, we might get multiple salary records per employee
    // Let's get the most recent salary for each employee during that period
    let finalSalaries = salaries;
    if (month && year) {
      const latestSalariesMap = new Map();

      salaries.forEach((salary) => {
        const employeeId = salary.employee.id;
        const existing = latestSalariesMap.get(employeeId);

        if (!existing || new Date(salary.effectiveDate) > new Date(existing.effectiveDate)) {
          latestSalariesMap.set(employeeId, salary);
        }
      });

      finalSalaries = Array.from(latestSalariesMap.values());
    }

    return {
      data: finalSalaries,
      totalCount: month && year ? finalSalaries.length : totalCount,
      totalPages: Math.ceil((month && year ? finalSalaries.length : totalCount) / pageSize),
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error("Error fetching salaries with employees:", error);
    return {
      data: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize,
    };
  }
}
