import { Control, useWatch } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { CreateEmployeeFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface EmploymentDetailsSectionProps {
  control: Control<CreateEmployeeFormData>;
  departments: Array<{
    id: string;
    name: string;
    _count: { employees: number };
  }>;
  filteredPositions: Array<{
    id: string;
    title: string;
    departmentId: string;
    department: { name: string };
    _count: { employees: number };
  }>;
  isDepartmentsLoading: boolean;
  isPositionsLoading: boolean;
}

export function EmploymentDetailsSection({
  control,
  departments,
  filteredPositions,
  isDepartmentsLoading,
  isPositionsLoading,
}: EmploymentDetailsSectionProps) {
  const watchedDepartmentId = useWatch({
    control,
    name: "departmentId",
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Employment Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isDepartmentsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem
                      key={department.id}
                      value={department.id}
                    >
                      {department.name} ({department._count.employees} employees)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="positionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!watchedDepartmentId || isPositionsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredPositions.map((position) => (
                    <SelectItem
                      key={position.id}
                      value={position.id}
                    >
                      {position.title} ({position._count.employees} employees)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {!watchedDepartmentId && "Select a department first"}
                {isPositionsLoading && "Loading positions..."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Hire Date and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="hireDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Hire Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>Set whether this employee is currently active</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
