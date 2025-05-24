"use client";

import Link from "next/link";
import { MoreHorizontal, Eye, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployeeActionsProps {
  employeeId: string;
  employeeName: string;
}

export function EmployeeActions({ employeeId, employeeName }: EmployeeActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Open menu for {employeeName}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/employees/${employeeId}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Employee
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/employees/${employeeId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Employee
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
