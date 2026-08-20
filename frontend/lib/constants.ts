// Global Constants
import { LayoutDashboard, Users, MonitorSmartphone, Ticket, Settings, ShieldCheck } from "lucide-react";

export const APP_CONFIG = {
  appName: "Asset Management System",
  version: "2.0.0",
  defaultPageSize: 10,
};

export const ROUTES = {
  DASHBOARD: "/superadmin",
  DEPARTMENTS: "/superadmin/departments",
  ASSETS: "/superadmin/assets",
  TICKETS: "/superadmin/tickets",
  SUB_ADMINS: "/superadmin/sub-admins",
  LOGIN: "/login",
};

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

export const TICKET_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;

// Auth Hardcodes (Temporary until backend is connected)
export const DEFAULT_AUTH = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gate2desk.com",
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "password",
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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

// Mock API delays
export const MOCK_API = {
  DELAY_SHORT: 500,
  DELAY_NORMAL: 1000,
  DELAY_LONG: 1500,
};
