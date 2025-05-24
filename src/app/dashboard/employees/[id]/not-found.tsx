import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeNotFound() {
  return (
    <div className="container p-6 max-w-2xl mx-auto">
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
        <div>
          <h1 className="text-3xl font-bold">Employee Not Found</h1>
          <p className="text-muted-foreground">The requested employee could not be found</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Employee Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The employee you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/dashboard/employees">Back to Employees</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
