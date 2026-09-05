"use client";

import React from "react";
import { Bell, HelpCircle, ChevronDown, Menu, LogOut, User } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/Sidebar";
import { HodSidebar } from "@/components/layout/HodSidebar";
import SubAdminSidebar from "@/components/layout/SubAdminSidebar";
import { EmployeeSidebar } from "@/components/layout/EmployeeSidebar";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  

  const { user, logout } = useAuth();

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    logout();
  };

  // Format Display Data
  const emp = (user as any)?.employee;
  const rawName = emp ? `${emp.firstName} ${emp.lastName}` : (user as any)?.fullName || user?.name;
  const displayName = rawName || (user?.email ? user.email.split("@")[0] : "Admin");
  
  const formatRole = (role?: string) => {
    if (!role) return "User";
    if (role === "SUPER_ADMIN") return "Super Administrator";
    if (role === "SUB_ADMIN") return "Sub Administrator";
    if (role === "HOD") return "Head of Department";
    if (role === "EMPLOYEE") return "Employee";
    return role;
  };
  const displayRole = formatRole(user?.role);
  const initials = displayName.substring(0, 2).toUpperCase();
  const profilePhoto = (user as any)?.employee?.profilePhoto || (user as any)?.profileImage || null;

  const isEmployeeRoute = pathname?.startsWith('/employee');

  return (
    <header className={`fixed top-0 right-0 left-0 ${isEmployeeRoute ? 'md:left-72' : 'md:left-56'} z-40 h-16 flex items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6`}>
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors">
            <Menu className="h-5 w-5 text-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r-0" style={{ background: "var(--brand-sidebar)" }}>
            <div className="flex flex-col h-full">
              {user?.role === "SUPER_ADMIN" ? (
                <SidebarContent />
              ) : user?.role === "HOD" ? (
                <HodSidebar />
              ) : user?.role === "SUB_ADMIN" ? (
                <SubAdminSidebar />
              ) : user?.role === "EMPLOYEE" ? (
                <EmployeeSidebar />
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search Bar */}
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="Search anything..."
        className="flex-1 max-w-md hidden sm:block"
      />

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-danger opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-danger"></span>
          </span>
        </button>

        {/* Help */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-xs font-semibold shrink-0 overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-foreground leading-tight capitalize">
                {displayName}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {displayRole}
              </p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground capitalize truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                  {displayRole}
                </span>
              </div>

              {/* Profile Link */}
              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                My Profile
              </button>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-brand-danger hover:bg-brand-danger/5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
