// @ts-nocheck
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { assetService } from "@/services/asset.service";
import { departmentService } from "@/services/department.service";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert-box";
import { Spinner } from "@/components/ui/spinner";


interface ShiftAssetModalProps {
  assetId: string;
  assetName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ShiftAssetModal({ assetId, assetName, isOpen, setIsOpen }: ShiftAssetModalProps) {
  const queryClient = useQueryClient();
  const [departmentId, setDepartmentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [floor, setFloor] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [seatStatus, setSeatStatus] = useState<{type: 'success' | 'warning' | 'loading', msg: string} | null>(null);

  // Fetch all departments
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
    enabled: isOpen,
  });

  const filteredDepartments = useMemo(() => {
    if (!floor) return departments;
    return departments.filter((d: any) => d.floor === floor);
  }, [departments, floor]);

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

    // Auto-fetch seat details when seat number changes (Debounced)
  useEffect(() => {
    if (!seatNumber) {
      setSeatStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSeatStatus({ type: 'loading', msg: 'Checking seat details...' });
      
      try {
        const url = new URL(window.location.origin + '/api/proxy/inventory/by-seat');
        url.searchParams.append('seatNumber', seatNumber);
        if (floor) url.searchParams.append('floor', floor);
        
        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setHostname(prev => prev || data.hostname || "");
            setIpAddress(prev => prev || data.ipAddress || "");
            setMacAddress(prev => prev || data.macAddress || "");
            setSeatStatus({ type: 'success', msg: 'Auto-filled from previous record.' });
          } else {
            setSeatStatus({ type: 'warning', msg: 'New Seat / No previous record found.' });
          }
        } else {
          setSeatStatus({ type: 'warning', msg: 'Failed to verify seat.' });
        }
      } catch (e) {
        console.error("Failed to fetch seat details", e);
        setSeatStatus(null);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [seatNumber, floor]); // dependencies

  const shiftMutation = useMutation({
    mutationFn: () => assetService.shiftAsset(assetId, employeeId, condition, notes, { floor, seatNumber, hostname, ipAddress, macAddress }),
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
      setError(err.message || "Failed to Shift Asset");
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
    shiftMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shift Asset</DialogTitle>
          <DialogDescription>
            Assign <span className="font-semibold text-foreground">{assetName}</span> to an employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <ErrorAlert message={error} />}
          {success && <SuccessAlert message="Asset shifted successfully!" />}

          <div className="space-y-2">
            <Label htmlFor="floor">Floor</Label>
            <select id="floor" value={floor} onChange={(e) => setFloor(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" disabled={shiftMutation.isPending}>
              <option value="">Select Floor</option>
              <option value="Basement">Basement</option>
              <option value="Ground (0)">Ground (0)</option>
              <option value="1st Floor">1st Floor</option>
              <option value="2nd Floor">2nd Floor</option>
              <option value="3rd Floor">3rd Floor</option>
              <option value="4th Floor">4th Floor</option>
              <option value="5th Floor">5th Floor</option>
              <option value="6th Floor">6th Floor</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Select Department *</Label>
              <select
                id="department"
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setEmployeeId(""); // Reset employee on dept change
                }}
                disabled={shiftMutation.isPending || isLoadingDepartments}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{floor ? "Select a department" : "Select a floor first (Optional)"}</option>
                {filteredDepartments.map((dept: Record<string, unknown>) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee">Select Assigned Employee (Optional)</Label>
            <select
              id="employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={shiftMutation.isPending || isLoadingEmployees || !departmentId}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seatNumber">Seat Number</Label>
                <input id="seatNumber" type="text" placeholder="e.g. N-25" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value.toUpperCase())} className="w-full px-3 py-2 border rounded-md" disabled={shiftMutation.isPending} />
                                {seatStatus && (
                  <div className={`flex items-center gap-1.5 text-xs mt-1.5 ${seatStatus.type === 'success' ? 'text-emerald-600' : seatStatus.type === 'loading' ? 'text-blue-600' : 'text-amber-600'}`}>
                    {seatStatus.type === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
                    <p>{seatStatus.msg}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname</Label>
                <input id="hostname" type="text" placeholder="e.g. DRITM-1700" value={hostname} onChange={(e) => setHostname(e.target.value)} className="w-full px-3 py-2 border rounded-md" disabled={shiftMutation.isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <input id="ipAddress" type="text" placeholder="e.g. 172.24.X.X" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md" disabled={shiftMutation.isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="macAddress">MAC Address</Label>
                <input id="macAddress" type="text" placeholder="Optional" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md" disabled={shiftMutation.isPending} />
              </div>
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
              disabled={shiftMutation.isPending}
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
            <Button type="submit" disabled={shiftMutation.isPending || !employeeId}>
              {shiftMutation.isPending ? (
                <>
                  <Spinner size="xs" className="mr-2" />
                  Shifting...
                </>
              ) : (
                "Shift Asset"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

