"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Plus, DollarSign } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { updateEmployee, updateSalaryWithCompensations, createCompensation } from "@/lib/actions/employee";
import {
  updateEmployeeSchema,
  type UpdateEmployeeFormData,
  compensationSchema,
  type CompensationFormData,
  salaryWithCompensationsSchema,
  type SalaryWithCompensationsFormData,
} from "@/lib/validations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditEmployeeFormProps {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    hireDate: Date;
    departmentId: string;
    positionId: string;
    isActive: boolean;
    salaries: Array<{
      id: string;
      basicSalary: number;
      grossSalary: number;
      netSalary: number;
      currency: string;
      salaryType: "HOURLY" | "MONTHLY" | "YEARLY";
      effectiveDate: Date;
      isActive: boolean;
      compensations: Array<{
        id: string;
        name: string;
        amount: number;
        description: string | null;
        type: "ALLOWANCE" | "BONUS" | "DEDUCTION";
        isPercentage: boolean;
      }>;
    }>;
  };
  departments: Array<{
    id: string;
    name: string;
    _count: { employees: number };
  }>;
  positions: Array<{
    id: string;
    title: string;
    departmentId: string;
    department: { name: string };
    _count: { employees: number };
  }>;
  compensations: Array<{
    id: string;
    name: string;
    amount: number;
    description?: string | null;
    type: "ALLOWANCE" | "BONUS" | "DEDUCTION";
    isPercentage: boolean;
  }>;
}

export function EditEmployeeForm({ employee, departments, positions, compensations }: EditEmployeeFormProps) {
  const router = useRouter();
  const [filteredPositions, setFilteredPositions] = useState(
    positions.filter((p) => p.departmentId === employee.departmentId),
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCompensationDialog, setShowCompensationDialog] = useState(false);
  const [showSalaryUpdate, setShowSalaryUpdate] = useState(false);

  const currentSalary = employee.salaries.find((s) => s.isActive);

  // Main employee form
  const form = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || "",
      hireDate: employee.hireDate,
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      isActive: employee.isActive,
      salary: {
        basicSalary: currentSalary?.basicSalary || 0,
        grossSalary: currentSalary?.grossSalary || 0,
        netSalary: currentSalary?.netSalary || 0,
        currency: currentSalary?.currency || "USD",
        salaryType: currentSalary?.salaryType || "MONTHLY",
        effectiveDate: currentSalary ? currentSalary.effectiveDate : new Date(),
      },
    },
  });

  // Compensation form
  const compensationForm = useForm<CompensationFormData>({
    resolver: zodResolver(compensationSchema),
    defaultValues: {
      name: "",
      amount: 0,
      description: "",
      type: "BONUS",
      isPercentage: false,
    },
  });

  // Salary with compensations form
  const salaryForm = useForm<SalaryWithCompensationsFormData>({
    resolver: zodResolver(salaryWithCompensationsSchema),
    defaultValues: {
      basicSalary: currentSalary?.basicSalary || 0,
      currency: currentSalary?.currency || "USD",
      salaryType: currentSalary?.salaryType || "MONTHLY",
      effectiveDate: new Date(),
      compensationIds: currentSalary?.compensations?.map((c) => c.id) || [],
    },
  });

  const watchedDepartmentId = form.watch("departmentId");
  const watchedCompensationIds = salaryForm.watch("compensationIds") || [];
  const watchedBasicSalary = salaryForm.watch("basicSalary");

  // Filter positions based on selected department
  useEffect(() => {
    if (watchedDepartmentId) {
      const filtered = positions.filter((position) => position.departmentId === watchedDepartmentId);
      setFilteredPositions(filtered);

      // Reset position if it doesn't belong to the new department
      const currentPositionId = form.getValues("positionId");
      if (currentPositionId && !filtered.some((p) => p.id === currentPositionId)) {
        form.setValue("positionId", "");
      }
    }
  }, [watchedDepartmentId, positions, form]);

  // Calculate real-time salary preview
  const calculateSalaryPreview = () => {
    const selectedCompensations = compensations.filter((c) => watchedCompensationIds.includes(c.id));
    let grossSalary = watchedBasicSalary;
    let netSalary = watchedBasicSalary;

    selectedCompensations.forEach((comp) => {
      const amount = comp.isPercentage ? (comp.amount / 100) * watchedBasicSalary : comp.amount;

      if (comp.type === "BONUS" || comp.type === "ALLOWANCE") {
        grossSalary += amount;
        netSalary += amount;
      } else if (comp.type === "DEDUCTION") {
        netSalary -= amount;
      }
    });

    return { grossSalary, netSalary };
  };

  async function onSubmit(data: UpdateEmployeeFormData) {
    setIsUpdating(true);
    try {
      const result = await updateEmployee(employee.id, data);

      if (result.success) {
        toast.success("Employee updated successfully");
        router.push(`/dashboard/employees/${employee.id}`);
      } else {
        toast.error(result.error || "Failed to update employee");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
    setIsUpdating(false);
  }

  async function onCreateCompensation(data: CompensationFormData) {
    try {
      const result = await createCompensation(data);

      if (result.success) {
        toast.success("Compensation created successfully");
        compensationForm.reset();
        setShowCompensationDialog(false);
        // Refresh the page to get updated compensations
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create compensation");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function onUpdateSalary(data: SalaryWithCompensationsFormData) {
    try {
      const result = await updateSalaryWithCompensations(
        employee.id,
        {
          basicSalary: data.basicSalary,
          currency: data.currency,
          salaryType: data.salaryType,
          effectiveDate: data.effectiveDate,
        },
        data.compensationIds || [],
      );

      if (result.success) {
        toast.success("Salary updated successfully");
        setShowSalaryUpdate(false);
        router.push(`/dashboard/employees/${employee.id}`);
      } else {
        toast.error(result.error || "Failed to update salary");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  const salaryPreview = calculateSalaryPreview();

  return (
    <div className="space-y-6">
      {/* Employee Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>Update basic employee details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Employment Details */}
              <Separator className="my-8" />
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-medium">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="positionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                                {position.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Hire Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
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
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <FormDescription>Whether this employee is currently active</FormDescription>
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

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Employee
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Salary and Compensation Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary & Compensation Management
          </CardTitle>
          <CardDescription>Manage employee salary and add bonuses, allowances, or deductions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Salary Display */}
          {currentSalary && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Salary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label>Basic Salary</Label>
                  <p className="font-semibold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currentSalary.currency,
                    }).format(currentSalary.basicSalary)}
                  </p>
                </div>
                <div>
                  <Label>Gross Salary</Label>
                  <p className="font-semibold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currentSalary.currency,
                    }).format(currentSalary.grossSalary)}
                  </p>
                </div>
                <div>
                  <Label>Net Salary</Label>
                  <p className="font-semibold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currentSalary.currency,
                    }).format(currentSalary.netSalary)}
                  </p>
                </div>
              </div>
              {currentSalary.compensations && currentSalary.compensations.length > 0 && (
                <div className="mt-3">
                  <Label>Active Compensations</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentSalary.compensations.map((comp) => (
                      <Badge
                        key={comp.id}
                        variant={comp.type === "DEDUCTION" ? "destructive" : "default"}
                      >
                        {comp.name} (
                        {comp.isPercentage
                          ? `${comp.amount}%`
                          : new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: currentSalary.currency,
                            }).format(comp.amount)}
                        )
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setShowSalaryUpdate(true)}
              variant="default"
            >
              Update Salary & Compensations
            </Button>

            <Dialog
              open={showCompensationDialog}
              onOpenChange={setShowCompensationDialog}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Compensation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Compensation</DialogTitle>
                  <DialogDescription>
                    Add a new bonus, allowance, or deduction that can be applied to employees
                  </DialogDescription>
                </DialogHeader>
                <Form {...compensationForm}>
                  <form
                    onSubmit={compensationForm.handleSubmit(onCreateCompensation)}
                    className="space-y-4"
                  >
                    <FormField
                      control={compensationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Performance Bonus"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={compensationForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="BONUS">Bonus</SelectItem>
                                <SelectItem value="ALLOWANCE">Allowance</SelectItem>
                                <SelectItem value="DEDUCTION">Deduction</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={compensationForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1000"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={compensationForm.control}
                      name="isPercentage"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Percentage-based</FormLabel>
                            <FormDescription>Whether this amount is a percentage of basic salary</FormDescription>
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

                    <FormField
                      control={compensationForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional details about this compensation..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCompensationDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Compensation</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Salary Update Dialog */}
          <Dialog
            open={showSalaryUpdate}
            onOpenChange={setShowSalaryUpdate}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Update Salary & Compensations</DialogTitle>
                <DialogDescription>
                  Update the employee&apos;s salary and select applicable compensations. The gross and net salary will
                  be calculated automatically.
                </DialogDescription>
              </DialogHeader>

              <Form {...salaryForm}>
                <form
                  onSubmit={salaryForm.handleSubmit(onUpdateSalary)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={salaryForm.control}
                      name="basicSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Basic Salary</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={salaryForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="CAD">CAD (C$)</SelectItem>
                              <SelectItem value="AUD">AUD (A$)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={salaryForm.control}
                      name="salaryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HOURLY">Hourly</SelectItem>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                              <SelectItem value="YEARLY">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={salaryForm.control}
                    name="effectiveDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Effective Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
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
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Compensations Selection */}
                  <div className="space-y-3">
                    <FormLabel>Select Compensations</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                      {compensations.map((compensation) => (
                        <FormField
                          key={compensation.id}
                          control={salaryForm.control}
                          name="compensationIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={compensation.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(compensation.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValues, compensation.id])
                                        : field.onChange(currentValues?.filter((value) => value !== compensation.id));
                                    }}
                                  />
                                </FormControl>
                                <div className="grid gap-1.5 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    {compensation.name}
                                    <Badge
                                      variant={compensation.type === "DEDUCTION" ? "destructive" : "default"}
                                      className="ml-2 text-xs"
                                    >
                                      {compensation.type}
                                    </Badge>
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {compensation.isPercentage
                                      ? `${compensation.amount}% of basic salary`
                                      : `Fixed amount: ${new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: salaryForm.watch("currency"),
                                        }).format(compensation.amount)}`}
                                  </p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Salary Preview */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Salary Preview</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label>Basic Salary</Label>
                        <p className="font-semibold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: salaryForm.watch("currency"),
                          }).format(watchedBasicSalary)}
                        </p>
                      </div>
                      <div>
                        <Label>Gross Salary</Label>
                        <p className="font-semibold text-green-600">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: salaryForm.watch("currency"),
                          }).format(salaryPreview.grossSalary)}
                        </p>
                      </div>
                      <div>
                        <Label>Net Salary</Label>
                        <p className="font-semibold text-blue-600">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: salaryForm.watch("currency"),
                          }).format(salaryPreview.netSalary)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSalaryUpdate(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update Salary</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
