const fs = require("fs");

let code = fs.readFileSync("components/features/hod/InventoryClientPage.tsx", "utf8");

const replacement = `const FLOOR_DEPARTMENTS: Record<string, string[]> = {
    "Basement": ["MMB", "Credit Mantri", "104", "College Process"],
    "Ground (0)": ["Traya", "Myntra HLCT", "Myntra M Now"],
    "1st Floor": ["Myntra Chat", "Muthoot Finance"],
    "2nd Floor": ["Myntra Email", "Myntra Voice", "AJIO"],
    "3rd Floor": ["Myntra IMVT", "Myntra Escalation Desk", "Myntra DOH"],
    "4th Floor": ["Flipkart Seller Support", "Shopcy MR", "Flipkart Seller"], // Including the existing one
    "5th Floor": ["Flipkart ROH", "Paytm OCL", "PSPCL"],
    "6th Floor": ["Flipkart Jeeves"]
  };

  const departments = useMemo(() => {
    if (!selectedFloor) return [];
    
    // Start with all hardcoded departments for this floor
    const expectedDepts = FLOOR_DEPARTMENTS[selectedFloor] || [];
    const deptMap = new Map<string, number>();
    expectedDepts.forEach(d => deptMap.set(d, 0));

    // Add dynamically found assets count
    inventoryData
      .filter((item: any) => (item.floor || "Unknown Floor") === selectedFloor)
      .forEach((item: any) => {
        const dept = item.department || "Unknown Department";
        if (!deptMap.has(dept)) deptMap.set(dept, 0);
        deptMap.set(dept, deptMap.get(dept)! + 1);
      });
      
    return Array.from(deptMap.entries()).map(([dept, count]) => ({
      name: dept,
      assetCount: count
    }));
  }, [inventoryData, selectedFloor]);`;

code = code.replace(
  /const departments = useMemo\(\(\) => \{[\s\S]*?\}, \[inventoryData, selectedFloor\]\);/,
  replacement
);

// Also need to update the floor deptCount to include these default departments if there are no assets
// Wait, actually the floor deptCount was calculated dynamically. We should just use FLOOR_DEPARTMENTS.length.

const floorReplacement = `const floors = useMemo(() => {
    const ALL_FLOORS = ["Basement", "Ground (0)", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor", "6th Floor"];
    const floorMap = new Map();
    
    // Initialize all standard floors with their default departments
    ALL_FLOORS.forEach(f => {
      floorMap.set(f, new Set(FLOOR_DEPARTMENTS[f] || []));
    });

    inventoryData.forEach((item: any) => {
      const fl = item.floor || "Unknown Floor";
      const dept = item.department || "Unknown Department";
      if (!floorMap.has(fl)) floorMap.set(fl, new Set());
      if (item.department) {
        floorMap.get(fl).add(dept);
      }
    });

    return Array.from(floorMap.entries()).map(([floor, depts]) => ({
      name: floor,
      deptCount: (depts as Set<string>).size
    }));
  }, [inventoryData]);`;

code = code.replace(
  /const floors = useMemo\(\(\) => \{[\s\S]*?\}, \[inventoryData\]\);/,
  floorReplacement
);

fs.writeFileSync("components/features/hod/InventoryClientPage.tsx", code);

