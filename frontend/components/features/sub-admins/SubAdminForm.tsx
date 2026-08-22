"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Upload, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSubAdminSchema, updateSubAdminSchema, SubAdminFormValues } from "@/lib/validations/subadmin";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubAdmin } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { departmentService } from "@/services/department.service";
import { Spinner } from "@/components/ui/spinner";


interface SubAdminFormProps {
  onSubmit: (data: SubAdminFormValues) => void;
  isLoading?: boolean;
  initialData?: SubAdmin;
}

export default function SubAdminForm({
  onSubmit,
  isLoading,
  initialData,
}: SubAdminFormProps) {
  const isEditMode = !!initialData;

  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
  });

  const AVAILABLE_DEPARTMENTS = departmentsData?.map(d => d.name) || [];

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<SubAdminFormValues>({
    resolver: zodResolver(isEditMode ? updateSubAdminSchema : createSubAdminSchema),
    values: initialData ? {
      name: initialData.name,
      email: initialData.email,
      status: initialData.status,
      departments: initialData.departments,
      profileImage: initialData.profileImage,
    } : {
      name: "",
      email: "",
      status: "Active",
      departments: [],
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.profileImage || null
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const selectedDepartments = watch("departments");
  const selectedStatus = watch("status");

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("profileImage", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form id="subadmin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
      <div className="flex justify-center pb-2">
        <ImageUpload
          value={imagePreview}
          onChange={(file) => {
            setValue("profileImage", file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
          }}
          onRemove={() => {
            setValue("profileImage", undefined);
            setImagePreview(null);
          }}
          label="Profile Picture"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          placeholder="Enter full name"
          {...register("name")}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-xs text-brand-danger font-medium">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@dritgroup.com"
          {...register("email")}
          disabled={isLoading || isEditMode}
        />
        {errors.email && (
          <p className="text-xs text-brand-danger font-medium">{errors.email.message}</p>
        )}
      </div>

      {!isEditMode && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                {...register("password")}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-brand-danger font-medium">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                {...register("confirmPassword")}
                disabled={isLoading}
                className="pr-10"
                onPaste={(e) => {
                  e.preventDefault();
                  setError("confirmPassword", {
                    type: "manual",
                    message: "Pasting is not allowed. Please type.",
                  });
                  setTimeout(() => {
                    clearErrors("confirmPassword");
                  }, 3000);
                }}
                onCopy={(e) => e.preventDefault()}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-brand-danger font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
      )}

      {isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setValue("status", e.target.value as "Active" | "Inactive")}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            disabled={isLoading}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {errors.status && (
            <p className="text-xs text-brand-danger font-medium">{errors.status.message}</p>
          )}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Label>Department Access *</Label>
        {isLoadingDepartments ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="xs" className="mr-2" />
            Loading departments...
          </div>
        ) : AVAILABLE_DEPARTMENTS.length === 0 ? (
          <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md border">
            No departments found. Super Admin needs to create departments first.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_DEPARTMENTS.map((dept) => (
              <div key={dept} className="flex items-center space-x-2">
                <Checkbox
                  id={`dept-${dept}`}
                  checked={selectedDepartments.includes(dept)}
                  onCheckedChange={() => toggleDepartment(dept)}
                  disabled={isLoading}
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
        )}
        {errors.departments && (
          <p className="text-xs text-brand-danger font-medium">{errors.departments.message}</p>
        )}
      </div>
    </form>
  );
}
