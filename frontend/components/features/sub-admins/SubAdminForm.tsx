"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subAdminSchema, SubAdminFormValues } from "@/lib/validations/subadmin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const AVAILABLE_DEPARTMENTS = ["IT", "HR", "Finance", "Operations", "Security"];

interface SubAdminFormProps {
  onSubmit: (data: SubAdminFormValues) => void;
  isLoading?: boolean;
}

export default function SubAdminForm({ onSubmit, isLoading }: SubAdminFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubAdminFormValues>({
    resolver: zodResolver(subAdminSchema),
    defaultValues: {
      departments: [],
      status: "Active",
    },
  });

  const selectedDepartments = watch("departments");

  const toggleDepartment = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      setValue(
        "departments",
        selectedDepartments.filter((d) => d !== dept),
        { shouldValidate: true }
      );
    } else {
      setValue("departments", [...selectedDepartments, dept], {
        shouldValidate: true,
      });
    }
  };

  return (
    <form id="subadmin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Enter full name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="email@dritgroup.com" {...register("email")} />
        {errors.email && (
          <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password (Optional)</Label>
        <Input id="password" type="password" placeholder="Min 8 characters" {...register("password")} />
        {errors.password && (
          <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <Label>Department Access</Label>
        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_DEPARTMENTS.map((dept) => (
            <div key={dept} className="flex items-center space-x-2">
              <Checkbox
                id={`dept-${dept}`}
                checked={selectedDepartments.includes(dept)}
                onCheckedChange={() => toggleDepartment(dept)}
              />
              <Label
                htmlFor={`dept-${dept}`}
                className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {dept}
              </Label>
            </div>
          ))}
        </div>
        {errors.departments && (
          <p className="text-xs text-red-500 font-medium">{errors.departments.message}</p>
        )}
      </div>
    </form>
  );
}
