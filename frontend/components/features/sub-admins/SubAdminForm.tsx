"use client";

import { useEffect, useState } from "react";
import { Upload, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subAdminSchema, SubAdminFormValues } from "@/lib/validations/subadmin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubAdmin } from "@/services/subAdmin.service";

const AVAILABLE_DEPARTMENTS = ["IT", "HR", "Finance", "Operations", "Security"];

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

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubAdminFormValues>({
    resolver: zodResolver(subAdminSchema),
    defaultValues: {
      departments: initialData?.departments || [],
      status: initialData?.status || "Active",
      name: initialData?.name || "",
      email: initialData?.email || "",
      profileImage: initialData?.profileImage || undefined,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.profileImage || null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        departments: initialData.departments,
        status: initialData.status,
        profileImage: initialData.profileImage,
      });
      if (initialData.profileImage) {
        setImagePreview(initialData.profileImage);
      }
    }
  }, [initialData, reset]);

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
      <div className="flex flex-col items-center justify-center space-y-3 pb-2">
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted transition-all hover:bg-muted/80">
          {imagePreview ? (
            <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground/50" />
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleImageChange}
            disabled={isLoading}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Profile Picture</p>
          <p className="text-xs text-muted-foreground">Click to upload image</p>
        </div>
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
          <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
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
          <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
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
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
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
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
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
            onChange={(e) => setValue("status", e.target.value as "Active" | "Suspend")}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="Active">Active</option>
            <option value="Suspend">Suspend</option>
          </select>
          {errors.status && (
            <p className="text-xs text-red-500 font-medium">{errors.status.message}</p>
          )}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Label>Department Access *</Label>
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
        {errors.departments && (
          <p className="text-xs text-red-500 font-medium">{errors.departments.message}</p>
        )}
      </div>
    </form>
  );
}
