import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assetService } from "@/services/asset.service";
import { Spinner } from "@/components/ui/spinner";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert-box";

interface UnassignAssetModalProps {
  assetId: string;
  assetName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function UnassignAssetModal({ assetId, assetName, isOpen, setIsOpen }: UnassignAssetModalProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [returnedTo, setReturnedTo] = useState("IT Room");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const unassignMutation = useMutation({
    mutationFn: () => assetService.unassignAsset(assetId, notes, returnedTo),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["department-assets"] });
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        window.location.reload();
      }, 1500);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to unassign asset");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    unassignMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unassign & Return Asset</DialogTitle>
          <DialogDescription>
            Return <span className="font-medium text-foreground">{assetName}</span> to the available pool.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <SuccessAlert message="Asset returned successfully!" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && <ErrorAlert message={error} />}

            <div className="space-y-2">
              <Label htmlFor="returnedTo">Where are you placing this asset?</Label>
              <select
                id="returnedTo"
                value={returnedTo}
                onChange={(e) => setReturnedTo(e.target.value)}
                disabled={unassignMutation.isPending}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] border-input"
              >
                <option value="IT Room">IT Room (Available for reuse)</option>
                <option value="Store">Store (Damaged / For Repair or Dump)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Return Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] border-input"
                rows={3}
                disabled={unassignMutation.isPending}
                placeholder="e.g. Returned from F-12 as user requested replacement..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={unassignMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={unassignMutation.isPending}>
                {unassignMutation.isPending ? <Spinner className="mr-2" size="sm" /> : null}
                Return Asset
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
