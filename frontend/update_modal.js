const fs = require("fs");
let code = fs.readFileSync("components/features/assets/AssignAssetModal.tsx", "utf8");

// Add state variables
code = code.replace(
  "const [notes, setNotes] = useState(\\\"\\\");",
  "const [notes, setNotes] = useState(\\\"\\\");\n  const [seatNumber, setSeatNumber] = useState(\\\"\\\");\n  const [hostname, setHostname] = useState(\\\"\\\");\n  const [ipAddress, setIpAddress] = useState(\\\"\\\");\n  const [macAddress, setMacAddress] = useState(\\\"\\\");"
);

// Add to mutationFn
code = code.replace(
  "mutationFn: () => assetService.assignAsset(assetId, employeeId, condition, notes)",
  "mutationFn: () => assetService.assignAsset(assetId, employeeId, condition, notes, { seatNumber, hostname, ipAddress, macAddress })"
);

// Add the UI fields
const uiFields = `            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seatNumber">Seat Number</Label>
                <input id="seatNumber" type="text" placeholder="e.g. N-25" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname</Label>
                <input id="hostname" type="text" placeholder="e.g. DRITM-1700" value={hostname} onChange={(e) => setHostname(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <input id="ipAddress" type="text" placeholder="e.g. 172.24.X.X" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="macAddress">MAC Address</Label>
                <input id="macAddress" type="text" placeholder="Optional" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>`;

code = code.replace(
  "<div className=\\"space-y-2\\">\\n            <Label htmlFor=\\"condition\\">Condition on Assign (Optional)</Label>",
  uiFields + "\\n\\n            <div className=\\"space-y-2\\">\\n            <Label htmlFor=\\"condition\\">Condition on Assign (Optional)</Label>"
);

fs.writeFileSync("components/features/assets/AssignAssetModal.tsx", code);
console.log("Updated AssignAssetModal.tsx");
