"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Ticket,
  Building2,
  Settings,
  ChevronRight,
  Headphones,
  ClipboardList, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

// Sub-Admin has limited nav options focusing on Department and HOD management
const navItems = [
  { label: "Dashboard", href: ROUTES.SUB_ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: "My Departments", href: ROUTES.SUB_ADMIN_DEPARTMENTS, icon: Building2 },
  { label: "Assets", href: ROUTES.SUB_ADMIN_ASSETS, icon: Package },
  { label: "Tickets", href: ROUTES.SUB_ADMIN_TICKETS, icon: Ticket },
  { label: "Help", href: ROUTES.SUB_ADMIN_HELP, icon: HelpCircle },
];

const bottomItems = [
  { label: "Settings", href: ROUTES.SUB_ADMIN_SETTINGS, icon: Settings },
];

type NavItemType = { label: string; href: string; icon: React.ElementType };

function NavItem({ item }: { item: NavItemType }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-all",
        isActive
          ? "bg-[var(--brand-primary)] text-white shadow-md"
          : "text-white/70 hover:text-white hover:bg-white/10"
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export default function SubAdminSidebar() {
  return (
    <aside
      className="hidden md:flex fixed inset-y-0 left-0 z-50 w-56 flex-col"
      style={{ background: "var(--brand-sidebar)" }}
    >
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
          <p className="text-[10px] text-white/55 leading-tight uppercase tracking-[0.15em] truncate mt-0.5">
            Asset Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="space-y-1 mb-2">
          {navItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </div>
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
            <p className="text-[9px] text-white/45 leading-tight">Contact your admin</p>
          </div>
        </div>
        <button className="w-full rounded-lg border border-white/20 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors">
          Contact Support
        </button>
      </div>
    </aside>
  );
}
