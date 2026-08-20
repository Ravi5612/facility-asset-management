"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { MOCK_API } from "@/lib/constants";
import { SuccessAlert } from "@/components/ui/alert-box";
import { AddDepartmentFormSchema, AddDepartmentFormValues } from "@/lib/validations/department";

export function AddDepartmentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddDepartmentFormValues>({
    resolver: zodResolver(AddDepartmentFormSchema),
  });

  const onSubmit = (data: AddDepartmentFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      reset();
      setTimeout(() => { setSuccess(false); setIsOpen(false); }, 2000);
    }, MOCK_API.DELAY_NORMAL);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) reset();
    }}>
      <DialogTrigger
        render={
          <Button className="gap-2 rounded-lg bg-[var(--brand-primary)] text-sm font-semibold text-white hover:bg-[var(--brand-primary)]/90 hover:shadow-md">
            <PlusCircle className="h-4 w-4" /> Add Department
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Department</DialogTitle>
          <DialogDescription>Create a new department in the organization.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="deptName">Department Name *</Label>
            <Input id="deptName" placeholder="e.g. Design Team" disabled={isLoading} {...register("deptName")} />
            {errors.deptName && <p className="text-xs text-brand-danger mt-1">{errors.deptName.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hodName">HOD Name *</Label>
              <Input id="hodName" placeholder="e.g. John Doe" disabled={isLoading} {...register("hodName")} />
              {errors.hodName && <p className="text-xs text-brand-danger mt-1">{errors.hodName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hodEmail">HOD Email *</Label>
              <Input id="hodEmail" type="email" placeholder="john@company.com" disabled={isLoading} {...register("hodEmail")} />
              {errors.hodEmail && <p className="text-xs text-brand-danger mt-1">{errors.hodEmail.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hodPassword">Password *</Label>
              <Input id="hodPassword" type="password" placeholder="••••••••" disabled={isLoading} {...register("hodPassword")} />
              {errors.hodPassword && <p className="text-xs text-brand-danger mt-1">{errors.hodPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hodConfirmPassword">Confirm Password *</Label>
              <Input id="hodConfirmPassword" type="password" placeholder="••••••••" disabled={isLoading} {...register("hodConfirmPassword")} />
              {errors.hodConfirmPassword && <p className="text-xs text-brand-danger mt-1">{errors.hodConfirmPassword.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" rows={3} disabled={isLoading}
              placeholder="Brief description of the department's role..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              {...register("description")} />
          </div>
          {success && <SuccessAlert message="Department added successfully!" />}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><PlusCircle className="mr-2 h-4 w-4" />Save Department</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
