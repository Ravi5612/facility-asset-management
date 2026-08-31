"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, FileText, Monitor, Ticket, HelpCircle, Package } from "lucide-react";
import React from "react";

export function HodSidebar() {
  const pathname = usePathname();
  const [deptName, setDeptName] = React.useState("Department");

  const deptSegment = pathname.split('/')[2] || "general";

  const isItDepartment = deptSegment.toLowerCase().includes('information-technology') || deptSegment.toLowerCase() === 'it';

  const navItems = [
    { title: "Dashboard", href: `/hod/${deptSegment}/dashboard`, icon: LayoutDashboard },
    ...(isItDepartment ? [{ title: "Inventory", href: `/hod/${deptSegment}/inventory`, icon: Package }] : []),
    { title: "Assets", href: `/hod/${deptSegment}/assets`, icon: Monitor },
    { title: "Tickets", href: `/hod/${deptSegment}/tickets`, icon: Ticket },
    { title: "Employees", href: `/hod/${deptSegment}/employees`, icon: Users },
    { title: "Attendance", href: `/hod/${deptSegment}/attendance`, icon: CalendarCheck },
    { title: "Recruitment", href: `/hod/${deptSegment}/recruitment`, icon: FileText },
    { title: "Help", href: `/hod/${deptSegment}/help`, icon: HelpCircle },
  ];

  React.useEffect(() => {
    // Read the user's department from localStorage (set during login)
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.departmentName) setDeptName(u.departmentName);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className="flex h-full flex-col border-r border-border" style={{ background: "var(--brand-sidebar)" }}>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10">
        <Link href={`/hod/${deptSegment}/dashboard`} className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1">
            <Image 
              src="/sidebar-logo.webp" 
              alt="Dr IT Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </div>
          <span>IT GROUP</span>
        </Link>
      </div>

      <div className="px-6 py-4">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
          HOD Portal
        </p>
        <p className="text-sm font-medium text-white/90 truncate">
          {deptName} Department
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-white/60"}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
