const fs = require("fs");
let code = fs.readFileSync("frontend/components/features/assets/HodAssetsClientPage.tsx", "utf8");
code = code.replace(
  "rawCategories.find",
  "(Array.isArray(rawCategories) ? rawCategories : (rawCategories as any)?.data || []).find"
);
fs.writeFileSync("frontend/components/features/assets/HodAssetsClientPage.tsx", code);
console.log("Fixed getNextId error!");
