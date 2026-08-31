const fs = require("fs");
let code = fs.readFileSync("components/layout/HodSidebar.tsx", "utf8");
code = code.replace(
  "LayoutDashboard, Users, CalendarCheck, FileText, Monitor, Ticket, HelpCircle",
  "LayoutDashboard, Users, CalendarCheck, FileText, Monitor, Ticket, HelpCircle, Package"
);
code = code.replace(
  "{ title: \\"Assets\\", href: \`/hod/\${deptSegment}/assets\`, icon: Monitor },",
  "{ title: \\"Inventory\\", href: \`/hod/\${deptSegment}/inventory\`, icon: Package },\n    { title: \\"Assets\\", href: \`/hod/\${deptSegment}/assets\`, icon: Monitor },"
);
fs.writeFileSync("components/layout/HodSidebar.tsx", code);
console.log("Updated Sidebar");
