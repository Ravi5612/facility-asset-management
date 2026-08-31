const fs = require("fs");
let code = fs.readFileSync("components/features/assets/AddAssetModal.tsx", "utf8");
code = code.replace(
  "c => c.category",
  "(c: any) => c.category"
);
fs.writeFileSync("components/features/assets/AddAssetModal.tsx", code);

let code2 = fs.readFileSync("components/features/assets/HodAssetsClientPage.tsx", "utf8");
code2 = code2.replace(
  "rawCategories.find",
  "(Array.isArray(rawCategories) ? rawCategories : (rawCategories as any)?.data || []).find"
);
fs.writeFileSync("components/features/assets/HodAssetsClientPage.tsx", code2);
console.log("Fixed TS errors");
