import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface FilterCondition {
  attribute: string;
  operation: string;
  value: string;
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

// Helper function for name filter conditions
function buildNameFilterCondition(operation: string, value: string): Prisma.EmployeeWhereInput {
  switch (operation) {
    case "equals":
      return { OR: [{ firstName: value }, { lastName: value }] };
    case "not_equals":
      return { AND: [{ firstName: { not: value } }, { lastName: { not: value } }] };
    case "contains":
      return { OR: [{ firstName: { contains: value } }, { lastName: { contains: value } }] };
    case "not_contains":
      return { AND: [{ firstName: { not: { contains: value } } }, { lastName: { not: { contains: value } } }] };
    case "starts_with":
      return { OR: [{ firstName: { startsWith: value } }, { lastName: { startsWith: value } }] };
    case "ends_with":
      return { OR: [{ firstName: { endsWith: value } }, { lastName: { endsWith: value } }] };
    default:
      return {};
  }
}

// Helper function for salary filter conditions
function buildSalaryFilterCondition(operation: string, value: string): Prisma.EmployeeWhereInput {
  const numericValue = Number(value);

  if (isNaN(numericValue)) {
    return {}; // Invalid number, return empty condition
  }

  switch (operation) {
    case "equals":
      return { salaries: { some: { isActive: true, basicSalary: numericValue } } };
    case "not_equals":
      return { salaries: { some: { isActive: true, basicSalary: { not: numericValue } } } };
    case "greater_than":
      return { salaries: { some: { isActive: true, basicSalary: { gt: numericValue } } } };
    case "greater_than_equal":
      return { salaries: { some: { isActive: true, basicSalary: { gte: numericValue } } } };
    case "less_than":
      return { salaries: { some: { isActive: true, basicSalary: { lt: numericValue } } } };
    case "less_than_equal":
      return { salaries: { some: { isActive: true, basicSalary: { lte: numericValue } } } };
    case "is_empty":
      return { salaries: { none: { isActive: true } } };
    case "is_not_empty":
      return { salaries: { some: { isActive: true } } };
    default:
      return {};
  }
}

// Helper function for isActive filter conditions
function buildIsActiveFilterCondition(operation: string, value: string): Prisma.EmployeeWhereInput {
  const booleanValue = value.toLowerCase() === "true";

  switch (operation) {
    case "equals":
      return { isActive: booleanValue };
    case "not_equals":
      return { isActive: { not: booleanValue } };
    default:
      return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const filtersParam = searchParams.get("filters");

    console.log("API Route: GET /api/employees", { page, pageSize, filtersParam });

    let filters: FilterCondition[] = [];
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch (e) {
        console.error("Error parsing filters:", e);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build where clause from filters
    let whereClause: Prisma.EmployeeWhereInput = {};

    if (filters && filters.length > 0) {
      const filterConditions: Prisma.EmployeeWhereInput[] = filters.map((filter) => {
        const { attribute, operation, value } = filter;

        // Handle special filter fields
        if (attribute === "name") {
          // Search across both firstName and lastName
          return buildNameFilterCondition(operation, value);
        } else if (attribute === "salary") {
          // Search in current active salary
          return buildSalaryFilterCondition(operation, value);
        } else if (attribute === "departmentName") {
          const condition = buildDepartmentFilterCondition("name", operation, value);
          return { department: condition };
        } else if (attribute === "positionTitle") {
          const condition = buildPositionFilterCondition("title", operation, value);
          return { position: condition };
        } else if (attribute === "isActive") {
          return buildIsActiveFilterCondition(operation, value);
        } else {
          return buildFilterCondition(attribute, operation, value);
        }
      });

      whereClause = { AND: filterConditions };
    }

    console.log("where: ", whereClause);

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

    const response = {
      data: employees,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize,
    };

    console.log("API Route: Returning", { totalCount, currentPage: page });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in employees API route:", error);
    return NextResponse.json(
      {
        data: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        error: "Failed to fetch employees",
      },
      { status: 500 },
    );
  }
}
