"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Upload, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { departmentService } from "@/services/department.service";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload } from "@/components/ui/image-upload";
import Image from "next/image";

const deptFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
  description: z.string().optional().nullable(),
});

type DeptFormValues = z.infer<typeof deptFormSchema>;

interface CreateDepartmentModalProps {
  onClose: () => void;
  editDepartmentId?: string;
}

export default function CreateDepartmentModal({ onClose, editDepartmentId }: CreateDepartmentModalProps) {
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { data: deptToEdit, isLoading: isFetching } = useQuery({
    queryKey: ["department", editDepartmentId],
    queryFn: () => departmentService.getDepartmentById(editDepartmentId!),
    enabled: !!editDepartmentId,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeptFormValues>({
    resolver: zodResolver(deptFormSchema),
  });

  useEffect(() => {
    if (deptToEdit) {
      reset({
        name: deptToEdit.name,
        code: deptToEdit.code,
        description: deptToEdit.description || "",
      });
      if (deptToEdit.imageUrl) {
        setImagePreview(deptToEdit.imageUrl);
      }
    }
  }, [deptToEdit, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: DeptFormValues) => departmentService.createDepartment({ ...data, description: data.description || undefined, image: imageFile || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      onClose();
    },
    onError: (err: any) => {
      alert("Failed to save department: " + err.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: DeptFormValues) => departmentService.updateDepartment(editDepartmentId!, { ...data, description: data.description || undefined, image: imageFile || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      onClose();
    },
    onError: (err: any) => {
      alert("Failed to update department: " + err.message);
    }
  });

  const onSubmit = (data: DeptFormValues) => {
    if (editDepartmentId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-muted/30">
          <h2 className="text-xl font-bold text-foreground">
            {editDepartmentId ? "Edit Department" : "Add Department"}
          </h2>
          <Button onClick={onClose} variant="ghost" size="icon" type="button" className="group rounded-full text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4 transition-all duration-300 group-hover:rotate-180 group-hover:scale-125 group-hover:text-destructive" />
            </Button>
        </div>

        {isFetching ? (
          <div className="p-8 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Image Upload */}
            <div className="flex justify-center pb-2">
              <ImageUpload
                value={imagePreview}
                onChange={(file) => {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
                onRemove={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                label="Department Image (Optional)"

              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Department Name
              </label>
              <input
                {...register("name")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Human Resources"
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Department Code
              </label>
              <input
                {...register("code")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                placeholder="e.g. HR"
              />
              {errors.code && <p className="text-destructive text-xs mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register("description")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none"
                placeholder="Brief description of the department..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px] bg-brand-primary text-white hover:bg-brand-primary/90">
                {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                {editDepartmentId ? "Save Changes" : "Add Department"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
