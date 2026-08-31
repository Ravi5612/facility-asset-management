const fs = require("fs");
let code = fs.readFileSync("components/features/hod/InventoryClientPage.tsx", "utf8");

// Imports
code = code.replace(
  "import React, { useState } from \"react\";",
  "import React, { useState } from \"react\";\nimport { useQuery } from \"@tanstack/react-query\";"
);

// State & Query
code = code.replace(
  "export default function InventoryClientPage() {",
  `export default function InventoryClientPage() {
  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return res.json();
    }
  });`
);

// Search filtering logic
code = code.replace(
  "const [search, setSearch] = useState(\"\");",
  `const [search, setSearch] = useState("");
  
  const filteredData = inventoryData.filter((item: any) => 
    (item.hostname?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (item.ipAddress?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (item.seatNumber?.toLowerCase() || "").includes(search.toLowerCase())
  );`
);

// Map over filteredData
code = code.replace(
  "{dummyInventory.map((item, idx) => (",
  `{isLoading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">Loading inventory data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">No records found.</td>
                </tr>
              ) : filteredData.map((item: any, idx: number) => (`
);

code = code.replace(
  "</td>\n                  <td className=\"px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400 sticky left-[80px] bg-card z-10\">{item.hostname}</td>\n                  <td className=\"px-4 py-3 font-mono\">{item.ip}</td>\n                  <td className=\"px-4 py-3 font-mono text-muted-foreground\">{item.mac}</td>",
  "</td>\n                  <td className=\"px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400 sticky left-[80px] bg-card z-10\">{item.hostname || \"- \"}</td>\n                  <td className=\"px-4 py-3 font-mono\">{item.ipAddress || \"- \"}</td>\n                  <td className=\"px-4 py-3 font-mono text-muted-foreground\">{item.macAddress || \"- \"}</td>"
);

code = code.replace(/\{item\.seat\}/g, "{item.seatNumber || \"- \"}");
code = code.replace(/\{item\.ramType\}/g, "{item.ramType || \"\"}");
code = code.replace(/\{item\.ram\}/g, "{item.ramGB || \"0\"}");

code = code.replace(
  "Showing 4 of 150+ records",
  "Showing {filteredData.length} records"
);

// Remove dummy array
code = code.replace(/const dummyInventory = \[[\s\S]*?\];/g, "");

fs.writeFileSync("components/features/hod/InventoryClientPage.tsx", code);
console.log("Updated UI to fetch from DB");
