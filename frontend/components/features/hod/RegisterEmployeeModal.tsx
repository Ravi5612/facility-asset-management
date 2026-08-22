"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { employeeApi } from "@/services/employeeApi.service";
import { departmentService } from "@/services/department.service";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload } from "@/components/ui/image-upload";


const employeeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  departmentName: z.string().min(1, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
  profilePic: z.unknown().optional(), // Can handle File or base64 later
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface RegisterEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterEmployeeModal({ onClose, onSuccess }: RegisterEmployeeModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch real departments
  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload this file. For now, create object URL for preview.
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setValue("profilePic", url);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: EmployeeFormValues) => employeeApi.createEmployee({
      name: data.name,
      email: data.email,
      password: data.password,
      designation: data.designation,
      departmentName: data.departmentName,
      profilePic: data.profilePic,
    }),
    onSuccess,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <h2 className="text-lg font-bold text-foreground">
            Register New Employee
          </h2>
          <Button onClick={onClose} variant="ghost" size="icon" type="button" className="group rounded-full text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4 transition-all duration-300 group-hover:rotate-180 group-hover:scale-125 group-hover:text-destructive" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form id="employee-form" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-5">
            {mutation.isError && (
              <div className="p-3 bg-brand-danger/10 text-brand-danger text-sm rounded-md border border-brand-danger/20">
                {mutation.error instanceof Error ? mutation.error.message : "Failed to register employee"}
              </div>
            )}

            {/* Profile Picture */}
            <div className="flex justify-center pb-2">
              <ImageUpload
                value={imagePreview}
                onChange={(file) => {
                  const url = URL.createObjectURL(file);
                  setImagePreview(url);
                  setValue("profilePic", url, { shouldValidate: true });
                }}
                onRemove={() => {
                  setImagePreview(null);
                  setValue("profilePic", undefined);
                }}
                label="Profile Picture (Optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <input
                  {...register("name")}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
                {errors.name && <p className="text-xs text-brand-danger mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  {...register("email")}
                  placeholder="jane@company.com"
                  type="email"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
                {errors.email && <p className="text-xs text-brand-danger mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                <select
                  {...register("departmentName")}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  disabled={isLoadingDepts}
                >
                  <option value="">{isLoadingDepts ? "Loading..." : "Select Department"}</option>
                  {departments?.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                {errors.departmentName && <p className="text-xs text-brand-danger mt-1">{errors.departmentName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
                <input
                  {...register("designation")}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                />
                {errors.designation && <p className="text-xs text-brand-danger mt-1">{errors.designation.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-brand-danger mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-brand-danger mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/10 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="employee-form" disabled={mutation.isPending} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white">
            {mutation.isPending && <Spinner size="xs" className="mr-2" />}
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
