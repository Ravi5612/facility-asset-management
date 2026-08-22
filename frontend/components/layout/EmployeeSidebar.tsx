"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Ticket,
  Wallet,
  Settings,
  ChevronRight,
  User,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/employee/attendance", icon: CalendarDays },
  { label: "My Assets", href: "/employee/assets", icon: Package },
  { label: "My Tickets", href: "/employee/tickets", icon: Ticket },
  { label: "Salary History", href: "/employee/salary", icon: Wallet },
];

const bottomItems = [
  { label: "My Profile", href: "/employee/profile", icon: User },
  { label: "Settings", href: "/employee/settings", icon: Settings },
];

export function EmployeeSidebar() {
  const pathname = usePathname();

  const renderLinks = (items: typeof navItems) => {
    return items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
            isActive
              ? "bg-white/20 text-white shadow-sm backdrop-blur-md"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )}
            />
            {item.label}
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-all duration-300",
              isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
            )}
          />
        </Link>
      );
    });
  };

  return (
    <aside 
      className="hidden md:flex flex-col w-72 border-r border-border/50 text-white shadow-2xl relative overflow-hidden h-screen"
      style={{ background: "var(--brand-sidebar)" }}
    >
      {/* Glow effects */}
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[40%] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[40%] rounded-full bg-black/10 blur-3xl" />

      {/* Brand */}
      <div className="relative flex h-20 items-center px-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-white p-1.5 shadow-inner">
             <Image 
                src="/sidebar-logo.webp" 
                alt="Logo" 
                fill 
                className="object-contain"
             />
          </div>
          <span className="text-xl font-black tracking-tight text-white drop-shadow-sm">
            Employee<span className="text-white/70 font-medium">Portal</span>
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="relative flex-1 overflow-y-auto py-8 px-4 scrollbar-hide">
        <div className="space-y-6">
          <div>
            <p className="px-4 text-xs font-bold tracking-wider text-white/50 uppercase mb-3 drop-shadow-sm">
              Menu
            </p>
            <nav className="space-y-1">{renderLinks(navItems)}</nav>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="relative p-4 border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <p className="px-4 text-xs font-bold tracking-wider text-white/50 uppercase mb-3">
          Account
        </p>
        <nav className="space-y-1">{renderLinks(bottomItems)}</nav>
      </div>
    </aside>
  );
}
