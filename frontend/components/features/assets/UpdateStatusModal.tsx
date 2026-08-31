import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { assetService } from "@/services/asset.service";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert-box";
import { Spinner } from "@/components/ui/spinner";

interface UpdateStatusModalProps {
  assetId: string;
  assetName: string;
  currentStatus?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function UpdateStatusModal({ assetId, assetName, currentStatus, isOpen, setIsOpen }: UpdateStatusModalProps) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState("IN_MAINTENANCE");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAction(currentStatus === 'Repair' ? 'REPAIRED' : 'IN_MAINTENANCE');
      setNotes("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, currentStatus]);

  const updateStatusMutation = useMutation({
    mutationFn: () => {
      let finalStatus = action;
      let finalNotes = notes;

      if (action === 'REPAIRED') {
        finalStatus = 'AVAILABLE';
        finalNotes = notes ? `[Repaired]: ${notes}` : '[Repaired]: Asset fixed and ready to assign.';
      } else if (action === 'BROKEN_STORE') {
        finalStatus = 'AVAILABLE';
        finalNotes = notes ? `[Unrepairable - To Store]: ${notes}` : '[Unrepairable - To Store]: Sent back to store.';
      }

      return assetService.updateAssetStatus(assetId, finalStatus, finalNotes);
    },
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
      setError(err.message || "Failed to update asset status");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateStatusMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Asset Status</DialogTitle>
          <DialogDescription>
            Change the status of <span className="font-medium text-foreground">{assetName}</span>.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <SuccessAlert message="Asset status updated successfully!" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && <ErrorAlert message={error} />}

            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <select
                id="status"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                disabled={updateStatusMutation.isPending}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] border-input"
              >
                {currentStatus === 'Repair' ? (
                  <>
                    <option value="REPAIRED">Repaired (Available to Assign)</option>
                    <option value="BROKEN_STORE">Cannot Repair (Return to Store)</option>
                  </>
                ) : (
                  <>
                    <option value="IN_MAINTENANCE">Send to IT Room (Repair)</option>
                  </>
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {action === 'REPAIRED' && "This will make the asset available again for assignment."}
                {action === 'BROKEN_STORE' && "This returns the asset to the Store's available pool for dumping."}
                {action === 'IN_MAINTENANCE' && "This marks the asset as under repair in the IT Room."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Reason / Notes</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] border-input"
                rows={3}
                disabled={updateStatusMutation.isPending}
                placeholder="Optional notes about this status change..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={updateStatusMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? <Spinner className="mr-2" size="sm" /> : null}
                Update Status
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
