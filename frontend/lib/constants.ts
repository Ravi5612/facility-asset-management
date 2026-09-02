// Global Constants
import { LayoutDashboard, Users, MonitorSmartphone, Ticket, Settings, ShieldCheck } from "lucide-react";

export const APP_CONFIG = {
  appName: "Asset Management System",
  version: "2.0.0",
  defaultPageSize: 10,
  defaultTheme: "blue",
};

export const ROUTES = {
  DASHBOARD: "/superadmin",
  DEPARTMENTS: "/superadmin/departments",
  ASSETS: "/superadmin/assets",
  TICKETS: "/superadmin/tickets",
  SUB_ADMINS: "/superadmin/sub-admins",
  VISITORS: "/superadmin/visitors",
  REPORTS: "/superadmin/reports",
  AUDIT_LOGS: "/superadmin/audit-logs",
  SETTINGS: "/superadmin/settings",
  LOGIN: "/login",
  
  // SUB ADMIN
  SUB_ADMIN_DASHBOARD: "/sub-admin/dashboard",
  SUB_ADMIN_DEPARTMENTS: "/sub-admin/department",
  SUB_ADMIN_ASSETS: "/sub-admin/assets",
  SUB_ADMIN_TICKETS: "/sub-admin/tickets",
  SUB_ADMIN_HELP: "/sub-admin/help",
  SUB_ADMIN_SETTINGS: "/sub-admin/settings",
  
  // EMPLOYEE
  EMPLOYEE_DASHBOARD: "/employee/dashboard",
  EMPLOYEE_ATTENDANCE: "/employee/attendance",
  EMPLOYEE_ASSETS: "/employee/assets",
  EMPLOYEE_TICKETS: "/employee/tickets",
  EMPLOYEE_SALARY: "/employee/salary",
  EMPLOYEE_HELP: "/employee/help",
  EMPLOYEE_PROFILE: "/employee/profile",
  EMPLOYEE_SETTINGS: "/employee/settings",
};

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  DEPT_HEAD: "DEPT_HEAD",
  EMPLOYEE: "EMPLOYEE",
};

export const ASSET_STATUS = {
  ASSIGNED: "Assigned",
  AVAILABLE: "Available",
  DUMP: "Dump",
  REPAIR: "Repair",
} as const;

export const EMPLOYEE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;

export const TICKET_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000/api" : "/api");

// Application Data Constants
export const DEPARTMENT_LIST = ["IT", "HR", "Finance", "Operations", "Security"];

export const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  IT: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  HR: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  Finance: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  Store: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  Security: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  Marketing: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
  Operations: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
};

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#ef4444'];

// Sidebar Navigation
export const NAV_ITEMS = [
  { title: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { title: "Departments", href: ROUTES.DEPARTMENTS, icon: Users },
  { title: "Assets", href: ROUTES.ASSETS, icon: MonitorSmartphone },
  { title: "Tickets", href: ROUTES.TICKETS, icon: Ticket },
  { title: "Sub-Admins", href: ROUTES.SUB_ADMINS, icon: ShieldCheck },
  { title: "Settings", href: "#", icon: Settings },
];


