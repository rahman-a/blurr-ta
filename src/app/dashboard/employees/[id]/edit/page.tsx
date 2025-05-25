import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getEmployeeById, getDepartments, getPositions, getCompensations } from "@/lib/actions/employee";
import { EditEmployeeForm } from "@/components/employees/edit-employee-form";

interface EditEmployeePageProps {
  params: {
    id: string;
  };
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const [employee, departments, positions, compensations] = await Promise.all([
    getEmployeeById(params.id),
    getDepartments(),
    getPositions(),
    getCompensations(),
  ]);

  if (!employee) {
    notFound();
  }

  const employeeName = `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="container p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <Link href={`/dashboard/employees/${employee.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit {employeeName}</h1>
          <p className="text-muted-foreground">Update employee information and compensation</p>
        </div>
      </div>

      {/* Edit Form */}
      <EditEmployeeForm
        employee={employee}
        departments={departments}
        positions={positions}
        compensations={compensations}
      />
    </div>
  );
}
