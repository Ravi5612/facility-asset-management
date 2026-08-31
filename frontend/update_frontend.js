const fs = require("fs");

// 1. Update Modal
let modal = fs.readFileSync("components/features/assets/AssignAssetModal.tsx", "utf8");
if (!modal.includes("const [floor, setFloor]")) {
  modal = modal.replace(
    "const [seatNumber, setSeatNumber] = useState(\\\"\\\");",
    "const [floor, setFloor] = useState(\\\"\\\");\\n  const [seatNumber, setSeatNumber] = useState(\\\"\\\");"
  );
  
  modal = modal.replace(
    "ipAddress, macAddress })",
    "ipAddress, macAddress, floor })"
  );
  
  const floorSelect = `              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <select id="floor" value={floor} onChange={(e) => setFloor(e.target.value)} className="w-full px-3 py-2 border rounded-md" disabled={assignMutation.isPending}>
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
              </div>`;
              
  modal = modal.replace(
    "<div className=\\"grid grid-cols-2 gap-4\\">",
    "<div className=\\"grid grid-cols-2 gap-4\\">\\n" + floorSelect
  );
  
  fs.writeFileSync("components/features/assets/AssignAssetModal.tsx", modal);
}

// 2. Update Service
let svc = fs.readFileSync("services/asset.service.ts", "utf8");
if (!svc.includes("networkDetails?: {")) {
  svc = svc.replace(
    "async assignAsset(assetId: string, employeeId: string, condition?: string, notes?: string): Promise<AssetCategory> \\n{",
    "async assignAsset(assetId: string, employeeId: string, condition?: string, notes?: string, networkDetails?: any): Promise<any> \\n{"
  );
  svc = svc.replace(
    "body: JSON.stringify({ employeeId, condition, notes })",
    "body: JSON.stringify({ employeeId, condition, notes, ...networkDetails })"
  );
  fs.writeFileSync("services/asset.service.ts", svc);
}

console.log("Frontend updated");
