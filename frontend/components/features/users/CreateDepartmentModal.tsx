"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { departmentService } from "@/services/department.service";

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
    }
  }, [deptToEdit, reset]);

  const createMutation = useMutation({
    mutationFn: (data: DeptFormValues) => departmentService.createDepartment(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: DeptFormValues) => departmentService.updateDepartment(editDepartmentId!, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department", editDepartmentId] });
      onClose();
    },
  });

  const mutation = editDepartmentId ? updateMutation : createMutation;
  const isPending = mutation.isPending || isFetching;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-bold text-foreground">
            {editDepartmentId ? "Edit Department" : "Add Department"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isFetching ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
            {mutation.isError && (
              <div className="p-3 bg-brand-danger/10 text-brand-danger text-sm rounded-md border border-brand-danger/20">
                {mutation.error instanceof Error ? mutation.error.message : `Failed to ${editDepartmentId ? 'update' : 'create'} department`}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department Name</label>
              <input
                {...register("name")}
                placeholder="e.g. Human Resources"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              {errors.name && <p className="text-xs text-brand-danger mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department Code</label>
              <input
                {...register("code")}
                placeholder="e.g. HR"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] uppercase"
              />
              {errors.code && <p className="text-xs text-brand-danger mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description (Optional)</label>
              <textarea
                {...register("description")}
                placeholder="Brief description of the department..."
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editDepartmentId ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
