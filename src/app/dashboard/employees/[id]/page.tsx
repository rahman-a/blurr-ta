import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign, Mail, Phone, User, Building2, Briefcase, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getEmployeeById } from "@/lib/actions/employee";

interface EmployeeDetailPageProps {
  params: {
    id: string;
  };
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const employee = await getEmployeeById(params.id);

  if (!employee) {
    notFound();
  }

  const currentSalary = employee.salaries.find((salary) => salary.isActive);
  const employeeName = `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="container p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <Link href="/dashboard/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{employeeName}</h1>
          <p className="text-muted-foreground">Employee Details</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`/dashboard/employees/${employee.id}/edit`}>Edit Employee</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Full Name:</span>
              </div>
              <p className="text-sm pl-6">{employeeName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
              </div>
              <p className="text-sm pl-6">
                <a
                  href={`mailto:${employee.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {employee.email}
                </a>
              </p>
            </div>

            {employee.phone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                </div>
                <p className="text-sm pl-6">
                  <a
                    href={`tel:${employee.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {employee.phone}
                  </a>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Hire Date:</span>
              </div>
              <p className="text-sm pl-6">{new Date(employee.hireDate).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Status:</span>
              </div>
              <div className="pl-6">
                <Badge variant={employee.isActive ? "default" : "secondary"}>
                  {employee.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Department:</span>
              </div>
              <p className="text-sm pl-6">{employee.department.name}</p>
              {employee.department.description && (
                <p className="text-xs text-muted-foreground pl-6">{employee.department.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Position:</span>
              </div>
              <p className="text-sm pl-6">{employee.position.title}</p>
              {employee.position.description && (
                <p className="text-xs text-muted-foreground pl-6">{employee.position.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Years of Service:</span>
              </div>
              <p className="text-sm pl-6">
                {Math.floor(
                  (new Date().getTime() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
                )}{" "}
                years
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Employee ID:</span>
              </div>
              <p className="text-xs text-muted-foreground pl-6 font-mono">{employee.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Salary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Current Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSalary ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Basic Salary:</span>
                  </div>
                  <p className="text-lg font-semibold pl-6">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currentSalary.currency,
                    }).format(currentSalary.basicSalary)}
                    <span className="text-sm text-muted-foreground ml-1">
                      /{currentSalary.salaryType.toLowerCase()}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Gross Salary:</span>
                  </div>
                  <p className="text-sm pl-6">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currentSalary.currency,
                    }).format(currentSalary.grossSalary)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Net Salary:</span>
                  </div>
                  <p className="text-sm pl-6">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currentSalary.currency,
                    }).format(currentSalary.netSalary)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Effective Since:</span>
                  </div>
                  <p className="text-sm pl-6">{new Date(currentSalary.effectiveDate).toLocaleDateString()}</p>
                </div>

                {currentSalary.compensations.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-medium text-sm">Compensations:</span>
                    <div className="pl-6 space-y-1">
                      {currentSalary.compensations.map((comp) => (
                        <div
                          key={comp.id}
                          className="flex justify-between text-sm"
                        >
                          <span>{comp.name}</span>
                          <span
                            className={`font-medium ${comp.type === "DEDUCTION" ? "text-red-600" : "text-green-600"}`}
                          >
                            {comp.type === "DEDUCTION" ? "-" : "+"}
                            {comp.isPercentage
                              ? `${comp.amount}%`
                              : new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: currentSalary.currency,
                                }).format(comp.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">No salary information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Salary History */}
      {employee.salaries.length > 1 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
            <CardDescription>Historical compensation records for this employee</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.salaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>{new Date(salary.effectiveDate).toLocaleDateString()}</TableCell>
                    <TableCell>{salary.endDate ? new Date(salary.endDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: salary.currency,
                      }).format(salary.basicSalary)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: salary.currency,
                      }).format(salary.grossSalary)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: salary.currency,
                      }).format(salary.netSalary)}
                    </TableCell>
                    <TableCell className="capitalize">{salary.salaryType.toLowerCase()}</TableCell>
                    <TableCell>
                      <Badge variant={salary.isActive ? "default" : "secondary"}>
                        {salary.isActive ? "Current" : "Historical"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
