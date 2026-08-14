"use client";

import { useState } from "react";
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

interface SubAdminModalProps {
  onSuccess: (data: SubAdminFormValues) => Promise<void>;
}

export default function SubAdminModal({ onSuccess }: SubAdminModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SubAdminFormValues) => {
    setIsSubmitting(true);
    try {
      await onSuccess(data);
      setOpen(false); // Close modal only on success
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary)]/90 hover:shadow-md">
          <UserPlus className="h-4 w-4" />
          Add Sub Admin
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Sub Admin</DialogTitle>
          <DialogDescription>
            Create a new sub-admin and assign department access permissions.
          </DialogDescription>
        </DialogHeader>

        {/* The form itself */}
        <SubAdminForm onSubmit={handleSubmit} isLoading={isSubmitting} />

        <DialogFooter className="mt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="subadmin-form"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary)]/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Sub Admin"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
