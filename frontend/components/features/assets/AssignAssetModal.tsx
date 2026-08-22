import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {} from "lucide-react";
import { assetService } from "@/services/asset.service";
import { departmentService } from "@/services/department.service";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert-box";
import { Spinner } from "@/components/ui/spinner";


interface AssignAssetModalProps {
  assetId: string;
  assetName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AssignAssetModal({ assetId, assetName, isOpen, setIsOpen }: AssignAssetModalProps) {
  const queryClient = useQueryClient();
  const [departmentId, setDepartmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch all departments
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
    enabled: isOpen,
  });

  // Fetch employees based on selected department
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["department-employees", departmentId],
    queryFn: async () => {
      // Direct call to backend (CORS allowed since departmentService uses it)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/departments/${departmentId}/employees`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch employees");
      return res.json();
    },
    enabled: !!departmentId && isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: () => assetService.assignAsset(assetId, employeeId, condition, notes),
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
      setError(err.message || "Failed to assign asset");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId) {
      setError("Please select a department");
      return;
    }
    if (!employeeId) {
      setError("Please select an employee");
      return;
    }
    setError(null);
    assignMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign <span className="font-semibold text-foreground">{assetName}</span> to an employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <ErrorAlert message={error} />}
          {success && <SuccessAlert message="Asset assigned successfully!" />}

          <div className="space-y-2">
            <Label htmlFor="department">Select Department *</Label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setEmployeeId(""); // Reset employee on dept change
              }}
              disabled={assignMutation.isPending || isLoadingDepartments}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a department</option>
              {departments.map((dept: Record<string, unknown>) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee">Select Employee *</Label>
            <select
              id="employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={assignMutation.isPending || isLoadingEmployees || !departmentId}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{departmentId ? "Select an employee" : "Select a department first"}</option>
              {employees.map((emp: Record<string, unknown>) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition on Assign (Optional)</Label>
            <input
              id="condition"
              type="text"
              placeholder="e.g. New, Good, Used"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={assignMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              placeholder="Any specific remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
              disabled={assignMutation.isPending}
            />
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={assignMutation.isPending || !employeeId}>
              {assignMutation.isPending ? (
                <>
                  <Spinner size="xs" className="mr-2" />
                  Assigning...
                </>
              ) : (
                "Assign Asset"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
