// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck } from "lucide-react";
import { assetService } from "@/services/asset.service";
import { departmentService } from "@/services/department.service";
import { inventoryService } from "@/services/inventory.service";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert-box";
import { Spinner } from "@/components/ui/spinner";


interface AssignAssetModalProps {
  assetId: string;
  assetName: string;
  categoryName?: string;
  asset?: any;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AssignAssetModal({ assetId, assetName, categoryName = 'CPU', asset, isOpen, setIsOpen }: AssignAssetModalProps) {
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
  const [existingSerialNumber, setExistingSerialNumber] = useState<string | null>(null);
  const [existingAssetDetails, setExistingAssetDetails] = useState<any | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [swapAction, setSwapAction] = useState("STORE");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [seatStatus, setSeatStatus] = useState<{type: 'success' | 'warning' | 'loading', msg: string} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

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
    queryFn: () => departmentService.getDepartmentEmployees(departmentId),
    enabled: !!departmentId && isOpen,
  });

    // Auto-fetch seat details when seat number changes (Debounced)
  useEffect(() => {
    if (!seatNumber) {
      setSeatStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSeatStatus({ type: 'loading', msg: 'Verifying seat...' });
      
      try {
        const data = await inventoryService.getBySeat(seatNumber, floor);
        if (data && Object.keys(data).length > 0) {
          setHostname(prev => prev || data.hostname || "");
            setIpAddress(prev => prev || data.ipAddress || "");
            setMacAddress(prev => prev || data.macAddress || "");
            
            const catLower = categoryName.toLowerCase();
            const peripheralSerial = catLower.includes('keyboard') ? data.keyboard : catLower.includes('mouse') ? data.mouse : catLower.includes('monitor') ? data.monitor : data.serialNumber;
            const peripheralDetails = catLower.includes('keyboard') ? data.keyboardDetails : catLower.includes('mouse') ? data.mouseDetails : catLower.includes('monitor') ? data.monitorDetails : data.cpuDetails;
            
            if (peripheralSerial) {
              setExistingSerialNumber(peripheralSerial);
              setExistingAssetDetails(peripheralDetails || null);
              setSeatStatus({ type: 'warning', msg: `A ${categoryName} is already assigned here (${peripheralSerial}).` });
            } else {
              setExistingSerialNumber(null);
              setExistingAssetDetails(null);
              setSeatStatus({ type: 'success', msg: `No ${categoryName} is currently on this seat. Ready to assign.` });
            }
          } else {
            setExistingSerialNumber(null);
            setExistingAssetDetails(null);
            setSeatStatus({ type: 'warning', msg: `New Seat / No ${categoryName} or previous record found.` });
        }
      } catch (e) {
        console.error("Failed to fetch seat details", e);
        setSeatStatus(null);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [seatNumber, floor]); // dependencies

  const assignMutation = useMutation({
    mutationFn: () => assetService.assignAsset(assetId, employeeId, condition, notes, { floor, seatNumber, hostname, ipAddress, macAddress }, replaceExisting, existingSerialNumber || undefined, swapAction),
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
    
    setError(null);
    assignMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign <span className="font-semibold text-foreground">{assetName}</span> to a seat or employee.
          </DialogDescription>
        </DialogHeader>

        {asset && (
          <div className="bg-slate-50 border p-3 rounded-md mb-2 mt-2">
            <h4 className="text-sm font-semibold mb-2 text-slate-800">New Asset Details ({categoryName})</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <p><span className="font-medium">Serial No:</span> {asset.serialNumber || 'N/A'}</p>
              <p><span className="font-medium">Code:</span> {asset.assetCode || asset.id}</p>
              <p><span className="font-medium">Purchase:</span> {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</p>
              <p><span className="font-medium">Warranty:</span> {(asset.warrantyExpiry || asset.warrantyExpiryDate) ? new Date(asset.warrantyExpiry || asset.warrantyExpiryDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <ErrorAlert message={error} />}
          {success && <SuccessAlert message="Asset assigned successfully!" />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <select id="floor" value={floor} onChange={(e) => setFloor(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" disabled={assignMutation.isPending}>
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
                  setEmployeeId("");
                }}
                disabled={assignMutation.isPending || isLoadingDepartments || !floor}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{!floor ? "Select a floor first" : "Select a department"}</option>
                {filteredDepartments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee (Optional)</Label>
              <select
                id="employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={assignMutation.isPending || isLoadingEmployees || !departmentId}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{!departmentId ? "Select a department first" : "Select an employee"}</option>
                {employees.map((emp: any) => (
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seatNumber">Seat Number</Label>
              <input id="seatNumber" type="text" placeholder={!departmentId ? "Select department first" : "e.g. N-25"} value={seatNumber} onChange={(e) => setSeatNumber(e.target.value.toUpperCase())} className="w-full px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={assignMutation.isPending || !departmentId} />
              {seatStatus && (
                <div className={`flex items-center gap-1.5 text-xs mt-1.5 ${seatStatus.type === 'success' ? 'text-emerald-600' : seatStatus.type === 'loading' ? 'text-blue-600' : 'text-amber-600'}`}>
                  {seatStatus.type === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
                  <p>{seatStatus.msg}</p>
                </div>
              )}
            </div>
            
            {categoryName.toLowerCase().includes('cpu') && (
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname</Label>
                <input id="hostname" type="text" placeholder="e.g. DRITM-1700" value={hostname} onChange={(e) => setHostname(e.target.value)} className="w-full px-3 py-2 border rounded-md" disabled={assignMutation.isPending} />
              </div>
            )}
            
            {categoryName.toLowerCase().includes('cpu') && (
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <input id="ipAddress" type="text" placeholder="e.g. 172.24.X.X" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md" disabled={assignMutation.isPending} />
              </div>
            )}
            
            {categoryName.toLowerCase().includes('cpu') && (
              <div className="space-y-2">
                <Label htmlFor="macAddress">MAC Address</Label>
                <input id="macAddress" type="text" placeholder="Optional" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md" disabled={assignMutation.isPending} />
              </div>
            )}
          </div>

          {existingSerialNumber && (
            <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md w-full">
              <p className="text-sm font-semibold text-amber-900 mb-2">
                Conflict: A {categoryName} ({existingSerialNumber}) is already assigned to this seat.
              </p>
              
              {existingAssetDetails && (
                <div className="mb-4 bg-white/60 p-3 rounded border border-amber-100 text-xs text-amber-900 grid grid-cols-2 gap-2">
                  <p><span className="font-medium opacity-75">Name:</span> {existingAssetDetails.name || 'N/A'}</p>
                  <p><span className="font-medium opacity-75">Code:</span> {existingAssetDetails.id || existingSerialNumber}</p>
                  <p><span className="font-medium opacity-75">Status:</span> {existingAssetDetails.status || 'N/A'}</p>
                  <p><span className="font-medium opacity-75">Assigned On:</span> {existingAssetDetails.assignedAt ? new Date(existingAssetDetails.assignedAt).toLocaleDateString() : 'N/A'}</p>
                  {existingAssetDetails.purchaseDate && <p><span className="font-medium opacity-75">Purchase Date:</span> {new Date(existingAssetDetails.purchaseDate).toLocaleDateString()}</p>}
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-amber-900 cursor-pointer">
                  <input type="radio" checked={replaceExisting} onChange={() => setReplaceExisting(true)} className="mt-0.5" />
                  Yes, replace the old system with this new one
                </label>
                <label className="flex items-center gap-2 text-sm text-amber-900 cursor-pointer">
                  <input type="radio" checked={!replaceExisting} onChange={() => setReplaceExisting(false)} className="mt-0.5" />
                  No, assign anyway (Not recommended)
                </label>
              </div>
              
              {replaceExisting && (
                <div className="mt-4 pl-6 border-l-2 border-amber-300 space-y-2">
                  <Label className="text-amber-900 block mb-1">What should be done with the old {categoryName}?</Label>
                  <select 
                    value={swapAction} 
                    onChange={e => setSwapAction(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="STORE">Return to Store (Available - Device is OK)</option>
                    <option value="STORE_DAMAGED">Return to Store (Damaged - For Repair/Dump)</option>
                    <option value="IT_ROOM">Send to IT Room (In Maintenance / Repair)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              placeholder="Any specific remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[60px]"
              disabled={assignMutation.isPending}
            />
          </div>

          {currentUser && (
            <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-3 flex items-center gap-3">
              <div className="bg-brand-primary/10 text-brand-primary p-2 rounded-full">
                <UserCheck size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Action Taken By</p>
                <p className="text-sm font-medium">{currentUser.email || "Staff"} <span className="text-muted-foreground font-normal">({currentUser.departmentName || currentUser.role})</span></p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={assignMutation.isPending}>
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
