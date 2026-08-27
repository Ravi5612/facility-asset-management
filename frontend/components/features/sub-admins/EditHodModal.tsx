// @ts-nocheck
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { hodApi } from "@/services/hodApi.service";

const hodFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  profilePic: z.unknown().optional(), // We'll just accept a URL or file optionally for now
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type HodFormValues = z.infer<typeof hodFormSchema>;

interface EditHodModalProps {
  hod: Record<string, unknown>;
  departmentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditHodModal({ hod, departmentName, onClose, onSuccess }: EditHodModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<HodFormValues>({
    resolver: zodResolver(hodFormSchema),
    defaultValues: {
      name: hod.name || hod.fullName || "",
      email: hod.email || "",
    }
  });

  const mutation = useMutation({
    mutationFn: (data: HodFormValues) => hodApi.updateHod(hod.id, data),
    onSuccess,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-bold text-foreground">
            Edit HOD - {departmentName}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          {mutation.isError && (
            <div className="p-3 bg-brand-danger/10 text-brand-danger text-sm rounded-md border border-brand-danger/20">
              {mutation.error instanceof Error ? mutation.error.message : "Failed to update HOD"}
            </div>
          )}

          
          <div className="flex justify-center pb-2 pt-2">
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
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              {...register("name")}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
            {errors.name && <p className="text-xs text-brand-danger mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="john@example.com"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
            {errors.email && <p className="text-xs text-brand-danger mt-1">{errors.email.message}</p>}
          </div>

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
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
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
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-brand-danger mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Edit HOD
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
