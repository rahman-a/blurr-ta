"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/ui/data-pagination";
import { EmployeesTable } from "@/components/employees/employees-table";
import { TableFilter, type FilterAttribute, type ActiveFilter } from "@/components/ui/table-filter";

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

// Define filter attributes for employees
const EMPLOYEE_FILTER_ATTRIBUTES: FilterAttribute[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "departmentName", label: "Department", type: "text" },
  { key: "positionTitle", label: "Position", type: "text" },
  { key: "hireDate", label: "Hire Date", type: "date" },
  { key: "salary", label: "Salary", type: "number" },
  {
    key: "isActive",
    label: "Status",
    type: "select",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];

const PAGE_SIZE = 5;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: PAGE_SIZE,
  });

  // Add ref to prevent concurrent fetches
  const isFetchingRef = useRef(false);

  // Simple state for filters (without nuqs for now to avoid server action issues)
  const [filters, setFilters] = useState<ActiveFilter[]>([]);

  // Create a reusable fetch function
  const fetchEmployeesForPage = async (page: number, filtersToUse?: ActiveFilter[]) => {
    if (isFetchingRef.current) {
      console.log("Already fetching, skipping...");
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);

    // Use provided filters or current state filters
    const currentFilters = filtersToUse || filters;

    try {
      console.log("Loading employees for page:", page, "with filters:", currentFilters);

      const backendFilters = currentFilters.map((filter) => ({
        attribute: filter.attribute,
        operation: filter.operation,
        value: filter.value,
      }));

      const searchParams = new URLSearchParams({
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
        filters: JSON.stringify(backendFilters),
      });

      console.log("Making API call to:", `/api/employees?${searchParams}`);
      const response = await fetch(`/api/employees?${searchParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch employees");
      }

      console.log("API response received:", result);
      setEmployees(result.data);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        pageSize: result.pageSize,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        pageSize: PAGE_SIZE,
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handlePageChange = (page: number) => {
    console.log("Page change requested:", page);
    fetchEmployeesForPage(page);
  };

  const handleFiltersChange = (newFilters: ActiveFilter[]) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
    // Reset to page 1 when filters change and pass the new filters directly
    fetchEmployeesForPage(1, newFilters);
  };

  // Simple effect that only runs once on mount
  useEffect(() => {
    console.log("Initial load effect triggered");
    fetchEmployeesForPage(1);
  }, []); // Empty dependency array

  return (
    <div className="container p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage and view your organization&apos;s employees</p>
          {!isLoading && pagination.totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {employees.length} of {pagination.totalCount} employees
              {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/dashboard/employees/salaries">
              <DollarSign className="h-4 w-4 mr-2" />
              View Salaries
            </Link>
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/dashboard/employees/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TableFilter
        attributes={EMPLOYEE_FILTER_ATTRIBUTES}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      {/* Employees Table */}
      <EmployeesTable
        employees={employees}
        isLoading={isLoading}
        totalCount={pagination.totalCount}
      />

      {/* Pagination */}
      <DataPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        className="mt-6"
      />
    </div>
  );
}
