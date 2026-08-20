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
import { Button } from "@/components/ui/button";
import { VisitorForm } from "./VisitorForm";
import { CreateVisitorFormValues } from "@/lib/validations/visitor";

interface VisitorModalProps {
  onSuccess: (data: CreateVisitorFormValues) => Promise<void>;
}

export function VisitorModal({ onSuccess }: VisitorModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateVisitorFormValues) => {
    setIsSubmitting(true);
    try {
      await onSuccess(data);
      setOpen(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2 rounded-lg bg-[var(--brand-primary)] text-sm font-semibold text-white hover:bg-[var(--brand-primary)]/90 hover:shadow-md">
            <UserPlus className="h-4 w-4" /> Log New Visitor
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Log New Visitor</DialogTitle>
          <DialogDescription className="text-base mt-1">
            Enter visitor details and assign them to a host employee.
          </DialogDescription>
        </DialogHeader>

        <VisitorForm onSubmit={handleSubmit} />

        <DialogFooter className="mt-6 sm:justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="visitor-form"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary)]/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Visitor"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
