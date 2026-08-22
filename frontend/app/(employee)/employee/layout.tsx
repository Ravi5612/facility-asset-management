import React from "react";
import { EmployeeSidebar } from "@/components/layout/EmployeeSidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[var(--brand-gray)]">
      <EmployeeSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Placeholder for a mobile header if needed later */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
