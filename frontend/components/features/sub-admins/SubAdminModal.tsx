"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Loader2 } from "lucide-react";
import SubAdminForm from "./SubAdminForm";
import { SubAdminFormValues } from "@/lib/validations/subadmin";
import { SubAdmin } from "@/services/subAdmin.service";

interface SubAdminModalProps {
  isEdit?: boolean;
  initialData?: SubAdmin;
  onSuccess: (data: SubAdminFormValues) => Promise<void>;
  onCancel?: () => void;
}

export default function SubAdminModal({
  isEdit = false,
  initialData,
  onSuccess,
  onCancel,
}: SubAdminModalProps) {
  const [open, setOpen] = useState(isEdit && !!initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setOpen(true);
    }
  }, [isEdit, initialData]);

  const handleSubmit = async (data: SubAdminFormValues) => {
    setIsSubmitting(true);
    try {
      await onSuccess(data);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEdit && (
        <DialogTrigger asChild>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary)]/90 hover:shadow-md">
            <UserPlus className="h-4 w-4" />
            Add Sub Admin
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Edit Sub Admin" : "Add Sub Admin"}
          </DialogTitle>
          <DialogDescription className="text-base mt-1">
            {isEdit
              ? "Update sub-admin details and department access permissions."
              : "Create a new sub-admin and assign department access permissions."}
          </DialogDescription>
        </DialogHeader>

        {/* The form itself */}
        <SubAdminForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          initialData={initialData}
        />

        <DialogFooter className="mt-6 sm:justify-end">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="subadmin-form"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary)]/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Saving..."}
              </>
            ) : isEdit ? (
              "Update Sub Admin"
            ) : (
              "Save Sub Admin"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
