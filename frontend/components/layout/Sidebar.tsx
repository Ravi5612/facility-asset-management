"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Ticket,
  Users,
  Building2,
  BarChart2,
  History,
  Settings,
  ChevronRight,
  UserPlus,
  Shield,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── NAV DATA ─── */
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Assets",
    icon: Package,
    children: [
      { label: "All Assets", href: "/dashboard/assets" },
      { label: "Asset Requests", href: "/dashboard/asset-requests" },
    ],
  },
  {
    label: "Tickets",
    icon: Ticket,
    children: [
      { label: "All Tickets", href: "/dashboard/tickets" },
      { label: "Create Ticket", href: "/dashboard/tickets/create" },
    ],
  },
  { label: "Visitors", href: "/dashboard/visitors", icon: UserPlus },
  { label: "Users", href: "/dashboard/users", icon: Users },
];

const adminItems = [
  {
    label: "Super Admin",
    icon: Shield,
    children: [
      { label: "Sub Admins", href: "/dashboard/sub-admins" },
      { label: "Manage Roles", href: "/dashboard/roles" },
    ],
  },
  {
    label: "Departments",
    icon: Building2,
    children: [
      { label: "All Departments", href: "/dashboard/departments" },
      { label: "+ Add Department", href: "/dashboard/departments/create" },
    ],
  },
];

const bottomItems = [
  { label: "Reports", href: "/dashboard/reports", icon: BarChart2 },
  { label: "History / Audit Logs", href: "/dashboard/audit-logs", icon: History },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

/* ─── TYPES ─── */
type SimpleItem = { label: string; href: string; icon: React.ElementType };
type GroupItem = { label: string; icon: React.ElementType; children: { label: string; href: string }[] };
type NavItemType = SimpleItem | GroupItem;

/* ─── NAV ITEM COMPONENT ─── */
function NavItem({ item }: { item: NavItemType }) {
  const pathname = usePathname();

  if ("children" in item) {
    const isOpen = item.children.some((c) => pathname.startsWith(c.href));
    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors select-none",
            isOpen
              ? "text-white bg-white/10"
              : "text-white/65 hover:text-white hover:bg-white/8"
          )}
        >
          <item.icon className="h-[15px] w-[15px] shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          <ChevronRight
            className={cn(
              "h-3 w-3 shrink-0 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        </div>
        {isOpen && (
          <div className="ml-[15px] mt-0.5 border-l border-white/10 pl-2.5 space-y-0.5 mb-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-md px-2.5 py-1.5 text-xs transition-colors",
                  pathname === child.href
                    ? "text-white font-semibold bg-white/10"
                    : "text-white/55 hover:text-white hover:bg-white/5"
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = pathname === (item as SimpleItem).href;
  return (
    <Link
      href={(item as SimpleItem).href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-[var(--brand-primary)] text-white shadow-md shadow-purple-900/30"
          : "text-white/65 hover:text-white hover:bg-white/8"
      )}
    >
      <item.icon className="h-[15px] w-[15px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/* ─── SIDEBAR ─── */
export default function Sidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col"
      style={{ backgroundColor: "var(--brand-sidebar)" }}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-4 border-b border-white/10">
        <Image
          src="/dr-it-logo.jpg"
          alt="DR IT GROUP"
          width={34}
          height={34}
          className="rounded-lg object-contain bg-white p-0.5 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">Dr IT GROUP</p>
          <p className="text-[9px] text-white/45 leading-tight uppercase tracking-wide truncate">
            Asset Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-none">
        {/* Main Nav */}
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}

        {/* Administration Section Label */}
        <div className="pt-4 pb-1.5">
          <p className="px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-white/30">
            Administration
          </p>
        </div>

        {/* Admin Nav */}
        {adminItems.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}

        {/* Bottom Nav */}
        <div className="pt-3 space-y-0.5">
          {bottomItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </div>
      </nav>

      {/* Support Card */}
      <div className="mx-3 mb-3 rounded-xl bg-white/5 border border-white/10 p-3 shrink-0">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]">
            <Headphones className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white leading-tight">Need Support?</p>
            <p className="text-[9px] text-white/45 leading-tight">We are here to help you</p>
          </div>
        </div>
        <button className="w-full rounded-lg border border-white/20 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors">
          Contact Support
        </button>
      </div>
    </aside>
  );
}
