"use client";

import { useState, useEffect } from "react";
import { DollarSign, Users, Filter, Download } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataPagination } from "@/components/ui/data-pagination";

import { getSalariesWithEmployees } from "@/lib/actions/employee";

interface SalaryData {
  id: string;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  currency: string;
  salaryType: "HOURLY" | "MONTHLY" | "YEARLY";
  effectiveDate: Date;
  isActive: boolean;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    department: {
      name: string;
    };
    position: {
      title: string;
    };
  };
  compensations: Array<{
    id: string;
    name: string;
    amount: number;
    type: "ALLOWANCE" | "BONUS" | "DEDUCTION";
    isPercentage: boolean;
  }>;
}

interface SalaryResponse {
  data: SalaryData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<SalaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<string>("current");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: 10,
  });

  // Generate month options for the past 12 months and next 12 months
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    // Add "Current Active Salaries" option
    options.push({ value: "current", label: "Current Active Salaries" });

    // Add past 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }

    // Add next 12 months
    for (let i = 1; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  const fetchSalaries = async (month?: number, year?: number, page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getSalariesWithEmployees(month, year, page, pagination.pageSize);
      const result = response as SalaryResponse;

      setSalaries(result.data);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        pageSize: result.pageSize,
      });
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setSalaries([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        pageSize: 10,
      });
    }
    setIsLoading(false);
  };

  const handleMonthFilter = (value: string) => {
    setFilterMonth(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page

    if (value === "current") {
      fetchSalaries(undefined, undefined, 1); // No month filter - get current active salaries
    } else {
      const [year, month] = value.split("-").map(Number);
      fetchSalaries(month, year, 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (filterMonth === "current") {
      fetchSalaries(undefined, undefined, page);
    } else {
      const [year, month] = filterMonth.split("-").map(Number);
      fetchSalaries(month, year, page);
    }
  };

  const calculateTotalCompensations = (compensations: SalaryData["compensations"], basicSalary: number) => {
    let bonuses = 0;
    let deductions = 0;

    compensations.forEach((comp) => {
      const amount = comp.isPercentage ? (comp.amount / 100) * basicSalary : comp.amount;

      if (comp.type === "BONUS" || comp.type === "ALLOWANCE") {
        bonuses += amount;
      } else if (comp.type === "DEDUCTION") {
        deductions += amount;
      }
    });

    return { bonuses, deductions };
  };

  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Email",
      "Department",
      "Position",
      "Basic Salary",
      "Bonuses & Allowances",
      "Deductions",
      "Gross Salary",
      "Net Salary",
      "Currency",
      "Salary Type",
      "Effective Date",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...salaries.map((salary) => {
        const { bonuses, deductions } = calculateTotalCompensations(salary.compensations, salary.basicSalary);
        const employeeName = `${salary.employee.firstName} ${salary.employee.lastName}`;

        return [
          `"${employeeName}"`,
          `"${salary.employee.email}"`,
          `"${salary.employee.department.name}"`,
          `"${salary.employee.position.title}"`,
          salary.basicSalary,
          bonuses,
          deductions,
          salary.grossSalary,
          salary.netSalary,
          salary.currency,
          salary.salaryType,
          format(new Date(salary.effectiveDate), "yyyy-MM-dd"),
          salary.employee.isActive ? "Active" : "Inactive",
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salaries-${filterMonth === "current" ? "current" : filterMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSalaries(); // Load current active salaries on mount
  }, []);

  return (
    <div className="container p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Salary Management</h1>
          <p className="text-muted-foreground">View and manage employee salary information</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={salaries.length === 0}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {salaries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">{salaries.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: salaries[0]?.currency || "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(salaries.reduce((sum, salary) => sum + salary.basicSalary, 0) / salaries.length)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg Basic Salary</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: salaries[0]?.currency || "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(salaries.reduce((sum, salary) => sum + salary.grossSalary, 0) / salaries.length)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg Gross Salary</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: salaries[0]?.currency || "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(salaries.reduce((sum, salary) => sum + salary.netSalary, 0) / salaries.length)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg Net Salary</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter salary data by time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:flex-1 sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Filter by Month</label>
              <Select
                value={filterMonth}
                onValueChange={handleMonthFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {salaries.length} of {pagination.totalCount} salary record{pagination.totalCount !== 1 ? "s" : ""}
              {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            Salary Overview
          </CardTitle>
          <CardDescription>
            {filterMonth === "current"
              ? "Current active salary records for all employees"
              : `Salary records for ${monthOptions.find((opt) => opt.value === filterMonth)?.label}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-12 w-full"
                />
              ))}
            </div>
          ) : salaries.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No salary records found</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                No salary data available for the selected time period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">Employee</TableHead>
                    <TableHead className="hidden sm:table-cell">Department</TableHead>
                    <TableHead className="hidden md:table-cell">Position</TableHead>
                    <TableHead className="min-w-[120px]">Basic Salary</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[140px]">Compensations</TableHead>
                    <TableHead className="min-w-[120px]">Gross Salary</TableHead>
                    <TableHead className="min-w-[120px]">Net Salary</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Effective Date</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaries.map((salary) => {
                    const employeeName = `${salary.employee.firstName} ${salary.employee.lastName}`;
                    const { bonuses, deductions } = calculateTotalCompensations(
                      salary.compensations,
                      salary.basicSalary,
                    );

                    return (
                      <TableRow key={`${salary.employee.id}-${salary.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm sm:text-base">{employeeName}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">{salary.employee.email}</div>
                            <div className="sm:hidden text-xs text-muted-foreground mt-1">
                              {salary.employee.department.name} • {salary.employee.position.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{salary.employee.department.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{salary.employee.position.title}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm sm:text-base">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: salary.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(salary.basicSalary)}
                          </div>
                          <div className="text-xs text-muted-foreground">{salary.salaryType.toLowerCase()}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="space-y-1">
                            {bonuses > 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                +
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: salary.currency,
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(bonuses)}
                              </div>
                            )}
                            {deductions > 0 && (
                              <div className="text-xs text-red-600 font-medium">
                                -
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: salary.currency,
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(deductions)}
                              </div>
                            )}
                            {bonuses === 0 && deductions === 0 && (
                              <div className="text-xs text-muted-foreground">None</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm sm:text-base">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: salary.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(salary.grossSalary)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-blue-600 text-sm sm:text-base">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: salary.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(salary.netSalary)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">
                          {salary.salaryType.toLowerCase()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(salary.effectiveDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant={salary.employee.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {salary.employee.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {salary.isActive && <div className="text-xs text-green-600">Current</div>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
