import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateEmployeeForm } from "@/components/employees/create-employee-form";

export default function CreateEmployeePage() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href="/dashboard/employees">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="w-full flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold">Create Employee</h1>
          <p className="text-muted-foreground">Add a new employee to your organization</p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<div>Loading...</div>}>
        <CreateEmployeeForm />
      </Suspense>
    </div>
  );
}
