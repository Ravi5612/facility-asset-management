import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetService } from "@/services/asset.service";
import { departmentService } from "@/services/department.service";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert-box";
import { Spinner } from "@/components/ui/spinner";

interface AllocateToDeptModalProps {
  assetId: string;
  assetName: string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export function AllocateToDeptModal({ assetId, assetName, isOpen, setIsOpen }: AllocateToDeptModalProps) {
  const queryClient = useQueryClient();
  const [departmentId, setDepartmentId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
    enabled: isOpen,
  });

  const shiftMutation = useMutation({
    mutationFn: () => assetService.shiftAsset(assetId, departmentId, notes),
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
      setError(err.message || "Failed to allocate asset");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId) {
      setError("Please select a department");
      return;
    }
    setError(null);
    shiftMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Allocate to Department</DialogTitle>
          <DialogDescription>
            Assign <span className="font-semibold text-foreground">{assetName}</span> to a department.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <ErrorAlert message={error} />}
          {success && <SuccessAlert message="Asset allocated successfully!" />}

          <div className="space-y-2">
            <Label htmlFor="department">Select Department *</Label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={shiftMutation.isPending || isLoadingDepartments}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a department</option>
              {departments.filter((d: any) => !d.name.toLowerCase().includes("store") && !d.name.toLowerCase().includes("inventory")).map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              placeholder="Any specific remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
              disabled={shiftMutation.isPending}
            />
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={shiftMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={shiftMutation.isPending || !departmentId}>
              {shiftMutation.isPending ? (
                <>
                  <Spinner size="xs" className="mr-2" />
                  Allocating...
                </>
              ) : (
                "Allocate Asset"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

