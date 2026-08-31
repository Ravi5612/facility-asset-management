const fs = require("fs");
let code = fs.readFileSync("components/features/hod/InventoryClientPage.tsx", "utf8");

// Remove the inline declaration
const blockToRemove = `  const FLOOR_DEPARTMENTS: Record<string, string[]> = {
    "Basement": ["MMB", "Credit Mantri", "104", "College Process"],
    "Ground (0)": ["Traya", "Myntra HLCT", "Myntra M Now"],
    "1st Floor": ["Myntra Chat", "Muthoot Finance"],
    "2nd Floor": ["Myntra Email", "Myntra Voice", "AJIO"],
    "3rd Floor": ["Myntra IMVT", "Myntra Escalation Desk", "Myntra DOH"],
    "4th Floor": ["Flipkart Seller Support", "Shopcy MR", "Flipkart Seller"], // Including the existing one
    "5th Floor": ["Flipkart ROH", "Paytm OCL", "PSPCL"],
    "6th Floor": ["Flipkart Jeeves"]
  };`;

code = code.replace(blockToRemove, "");

// Add it to the top after imports
const replacement = `import { Download, Search, Filter, Plus, Package, Layers, Users, ChevronRight, ArrowLeft } from "lucide-react";

const FLOOR_DEPARTMENTS: Record<string, string[]> = {
  "Basement": ["MMB", "Credit Mantri", "104", "College Process"],
  "Ground (0)": ["Traya", "Myntra HLCT", "Myntra M Now"],
  "1st Floor": ["Myntra Chat", "Muthoot Finance"],
  "2nd Floor": ["Myntra Email", "Myntra Voice", "AJIO"],
  "3rd Floor": ["Myntra IMVT", "Myntra Escalation Desk", "Myntra DOH"],
  "4th Floor": ["Flipkart Seller Support", "Shopcy MR", "Flipkart Seller"],
  "5th Floor": ["Flipkart ROH", "Paytm OCL", "PSPCL"],
  "6th Floor": ["Flipkart Jeeves"]
};`;

code = code.replace("import { Download, Search, Filter, Plus, Package, Layers, Users, ChevronRight, ArrowLeft } from \"lucide-react\";", replacement);

fs.writeFileSync("components/features/hod/InventoryClientPage.tsx", code);

