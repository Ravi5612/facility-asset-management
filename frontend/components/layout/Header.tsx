"use client";

import { Bell, HelpCircle, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-56 z-40 h-16 flex items-center justify-between gap-4 border-b border-border bg-card px-6">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search anything..."
          className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </span>
        </button>

        {/* Help */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <HelpCircle className="h-4.5 w-4.5 text-muted-foreground" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Profile */}
        <button className="flex items-center gap-2.5 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-xs font-semibold shrink-0">
            SA
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-tight">
              Super Admin
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Super Administrator
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
