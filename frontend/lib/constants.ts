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

// Sidebar Navigation
export const NAV_ITEMS = [
  { title: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { title: "Departments", href: ROUTES.DEPARTMENTS, icon: Users },
  { title: "Assets", href: ROUTES.ASSETS, icon: MonitorSmartphone },
  { title: "Tickets", href: ROUTES.TICKETS, icon: Ticket },
  { title: "Sub-Admins", href: ROUTES.SUB_ADMINS, icon: ShieldCheck },
  { title: "Settings", href: "#", icon: Settings },
];


