import React from "react";
import { EmployeeSidebar } from "@/components/layout/EmployeeSidebar";
import Header from "@/components/layout/Header";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
        <EmployeeSidebar />
      </div>
      <div className="flex-1 min-w-0 flex flex-col md:pl-72 min-h-screen transition-all">
        <Header />
        <main className="flex-1 flex flex-col min-h-0 min-w-0 p-4 md:p-6 lg:p-8 mt-16 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
