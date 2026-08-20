import { AssetItem, AssetCategory } from "@/types";

const people = ["Ravi Rai", "Amit Kumar", "Priya Singh", "Sita Sharma", "Rahul Verma", "Neha Gupta", "Vikas Joshi", "Pooja Mehra"];

function makeMice(): AssetItem[] {
  return Array.from({ length: 30 }, (_, i) => {
    const status: AssetItem["status"] = i < 20 ? "Assigned" : i < 27 ? "Available" : i < 29 ? "Dump" : "Repair";
    const person = people[i % people.length];
    return {
      id: `MSE-${String(i + 1).padStart(3, "0")}`, serialNumber: `MZ${1000 + i}`,
      purchaseDate: `2023-${String((i % 12) + 1).padStart(2, "0")}-15`,
      warrantyExpiry: i < 25 ? `2025-${String((i % 12) + 1).padStart(2, "0")}-15` : null,
      status, assignedTo: status === "Assigned" ? person : null,
      assignedOn: status === "Assigned" ? `2023-${String((i % 12) + 1).padStart(2, "0")}-20` : null,
      dumpedOn: status === "Dump" ? "2024-03-10" : null,
      repairedOn: status === "Repair" ? "2024-05-01" : null,
      notes: status === "Dump" ? "Scroll wheel broken" : status === "Repair" ? "Sensor repair" : "",
      history: [
        { action: "Purchased", person: "Admin", date: `2023-${String((i % 12) + 1).padStart(2, "0")}-15`, note: "Added to inventory" },
        ...(status === "Assigned" ? [{ action: "Assigned", person, date: `2023-${String((i % 12) + 1).padStart(2, "0")}-20`, note: `Assigned to ${person}` }] : []),
        ...(status === "Dump" ? [{ action: "Dumped", person: "Admin", date: "2024-03-10", note: "Scroll wheel broken, beyond repair" }] : []),
        ...(status === "Repair" ? [{ action: "Sent for Repair", person: "Rahul Verma", date: "2024-05-01", note: "Sensor issue" }] : []),
      ],
    };
  });
}

function makeKeyboards(): AssetItem[] {
  return Array.from({ length: 30 }, (_, i) => {
    const status: AssetItem["status"] = i < 18 ? "Assigned" : i < 28 ? "Available" : "Dump";
    const person = people[i % people.length];
    return {
      id: `KBD-${String(i + 1).padStart(3, "0")}`, serialNumber: `KB${2000 + i}`,
      purchaseDate: `2023-${String((i % 12) + 1).padStart(2, "0")}-10`,
      warrantyExpiry: i < 26 ? `2025-${String((i % 12) + 1).padStart(2, "0")}-10` : null,
      status, assignedTo: status === "Assigned" ? person : null,
      assignedOn: status === "Assigned" ? `2023-${String((i % 12) + 1).padStart(2, "0")}-12` : null,
      dumpedOn: status === "Dump" ? "2024-04-20" : null,
      repairedOn: null, notes: status === "Dump" ? "Keys not working" : "",
      history: [
        { action: "Purchased", person: "Admin", date: `2023-${String((i % 12) + 1).padStart(2, "0")}-10`, note: "Added to inventory" },
        ...(status === "Assigned" ? [{ action: "Assigned", person, date: `2023-${String((i % 12) + 1).padStart(2, "0")}-12`, note: `Assigned to ${person}` }] : []),
        ...(status === "Dump" ? [{ action: "Dumped", person: "Admin", date: "2024-04-20", note: "Multiple keys non-functional" }] : []),
      ],
    };
  });
}

export const staticAssetsData: AssetCategory[] = [
  {
    category: "Laptop", name: "Laptops", prefix: "LAP",
    items: [
      { id: "LAP-001", serialNumber: "C02X98712", purchaseDate: "2024-01-15", warrantyExpiry: "2027-01-15", status: "Assigned", assignedTo: "Ravi Rai", assignedOn: "2024-06-02", dumpedOn: null, repairedOn: null, notes: "", history: [{ action: "Purchased", person: "Admin", date: "2024-01-15", note: "" }, { action: "Assigned", person: "Amit Kumar", date: "2024-01-16", note: "" }, { action: "Reassigned", person: "Ravi Rai", date: "2024-06-02", note: "Transferred" }] },
      { id: "LAP-002", serialNumber: "PF3B12XY", purchaseDate: "2021-06-01", warrantyExpiry: null, status: "Dump", assignedTo: null, assignedOn: null, dumpedOn: "2024-01-10", repairedOn: null, notes: "Motherboard failed", history: [{ action: "Purchased", person: "Admin", date: "2021-06-01", note: "" }, { action: "Assigned", person: "Sita Sharma", date: "2021-06-02", note: "" }, { action: "Dumped", person: "Admin", date: "2024-01-10", note: "Motherboard failure" }] },
      { id: "LAP-003", serialNumber: "C02Y44821", purchaseDate: "2024-03-01", warrantyExpiry: "2027-03-01", status: "Assigned", assignedTo: "Priya Singh", assignedOn: "2024-03-02", dumpedOn: null, repairedOn: null, notes: "", history: [{ action: "Purchased", person: "Admin", date: "2024-03-01", note: "" }, { action: "Assigned", person: "Priya Singh", date: "2024-03-02", note: "" }] },
    ],
  },    
  {
    category: "Monitor", name: "Monitors", prefix: "MON",
    items: [
      { id: "MON-001", serialNumber: "CN-0XX123", purchaseDate: "2023-11-20", warrantyExpiry: "2026-11-20", status: "Available", assignedTo: null, assignedOn: null, dumpedOn: null, repairedOn: null, notes: "", history: [{ action: "Purchased", person: "Admin", date: "2023-11-20", note: "" }, { action: "Returned", person: "Priya Singh", date: "2024-05-30", note: "Employee left" }] },
      { id: "MON-002", serialNumber: "34WN80C", purchaseDate: "2024-02-28", warrantyExpiry: "2027-02-28", status: "Assigned", assignedTo: "Sita Sharma", assignedOn: "2024-03-01", dumpedOn: null, repairedOn: null, notes: "", history: [{ action: "Purchased", person: "Admin", date: "2024-02-28", note: "" }, { action: "Assigned", person: "Sita Sharma", date: "2024-03-01", note: "" }] },
    ],
  },
  { category: "Mouse", name: "Mouse", prefix: "MSE", items: makeMice() },
  { category: "Keyboard", name: "Keyboards", prefix: "KBD", items: makeKeyboards() },
  {
    category: "Cable", name: "Cables (VGA / HDMI)", prefix: "CBL",
    items: [
      { id: "CBL-001", serialNumber: "VGA-1001", purchaseDate: "2022-04-10", warrantyExpiry: null, status: "Available", assignedTo: null, assignedOn: null, dumpedOn: null, repairedOn: null, notes: "VGA 1.5m", history: [{ action: "Purchased", person: "Admin", date: "2022-04-10", note: "" }, { action: "Returned", person: "Amit Kumar", date: "2023-08-20", note: "" }] },
      { id: "CBL-002", serialNumber: "VGA-1002", purchaseDate: "2022-05-15", warrantyExpiry: null, status: "Assigned", assignedTo: "Neha Gupta", assignedOn: "2022-05-16", dumpedOn: null, repairedOn: null, notes: "VGA 3m", history: [{ action: "Purchased", person: "Admin", date: "2022-05-15", note: "" }, { action: "Assigned", person: "Neha Gupta", date: "2022-05-16", note: "" }] },
      { id: "CBL-003", serialNumber: "HDM-2001", purchaseDate: "2023-03-01", warrantyExpiry: null, status: "Available", assignedTo: null, assignedOn: null, dumpedOn: null, repairedOn: null, notes: "HDMI 2m", history: [{ action: "Purchased", person: "Admin", date: "2023-03-01", note: "" }] },
      { id: "CBL-004", serialNumber: "HDM-2002", purchaseDate: "2023-06-20", warrantyExpiry: null, status: "Dump", assignedTo: null, assignedOn: null, dumpedOn: "2023-01-05", repairedOn: null, notes: "HDMI - connector broken", history: [{ action: "Purchased", person: "Admin", date: "2023-06-20", note: "" }, { action: "Dumped", person: "Admin", date: "2023-01-05", note: "Connector broken" }] },
    ],
  },
];
