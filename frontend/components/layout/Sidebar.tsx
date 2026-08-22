"use client";

import React from "react";
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

import { ROUTES } from "@/lib/constants";

/* ─── NAV DATA ─── */
const navItems = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Sub Admins", href: ROUTES.SUB_ADMINS, icon: Shield },
  { label: "Assets", href: ROUTES.ASSETS, icon: Package },
  { label: "Tickets", href: ROUTES.TICKETS, icon: Ticket },
  { label: "Visitors", href: ROUTES.VISITORS, icon: UserPlus },
  { label: "Departments", href: ROUTES.DEPARTMENTS, icon: Building2 },
];

const bottomItems = [
  { label: "Reports", href: ROUTES.REPORTS, icon: BarChart2 },
  { label: "History / Audit Logs", href: ROUTES.AUDIT_LOGS, icon: History },
  { label: "Settings", href: ROUTES.SETTINGS, icon: Settings },
];

/* ─── TYPES ─── */
type SimpleItem = { label: string; href: string; icon: React.ElementType };
type GroupItem = { label: string; icon: React.ElementType; children: { label: string; href: string }[] };
type NavItemType = SimpleItem | GroupItem;

/* ─── NAV ITEM COMPONENT ─── */
function NavItem({ item }: { item: NavItemType }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if ("children" in item && item.children.some((c) => pathname.startsWith(c.href))) {
      setIsOpen(true);
    }
  }, [pathname, item]);

  if ("children" in item) {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold cursor-pointer transition-colors select-none",
            isOpen
              ? "text-white bg-white/10"
              : "text-white/70 hover:text-white hover:bg-white/8"
          )}
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
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
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === child.href
                    ? "text-white font-bold bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
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
        "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-all",
        isActive
          ? "bg-[var(--brand-primary)] text-white shadow-md shadow-purple-900/30"
          : "text-white/70 hover:text-white hover:bg-white/8"
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/* ─── SIDEBAR CONTENT ─── */
export function SidebarContent() {
  return (
    <>
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white p-1">
          <Image 
            src="/sidebar-logo.webp" 
            alt="Dr IT Logo" 
            width={36} 
            height={36} 
            className="object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-extrabold text-white leading-tight truncate tracking-wide">Dr IT GROUP</p>
          <p className="text-[10px] text-white/60 leading-tight uppercase tracking-[0.15em] truncate mt-0.5">
            Asset Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {/* Main Nav */}
        <div className="space-y-1 mb-2">
          {navItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </div>

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
    </>
  );
}

/* ─── DESKTOP SIDEBAR ─── */
export default function Sidebar() {
  return (
    <aside
      className="hidden md:flex fixed inset-y-0 left-0 z-50 w-56 flex-col"
      style={{ background: "var(--brand-sidebar)" }}
    >
      <SidebarContent />
    </aside>
  );
}
