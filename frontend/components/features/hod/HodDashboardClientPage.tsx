"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, UserX } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { employeeApi } from "@/services/employeeApi.service";
import { DashboardSkeleton } from "@/components/ui/skeletons";



export default function HodDashboardClientPage() {
  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeApi.getEmployees,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DashboardSkeleton />
      </div>
    );
  }

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter((e) => e.status === "ACTIVE").length || 0;
  const inactiveEmployees = totalEmployees - activeEmployees;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Department Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your department's employees and operations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SummaryCard
          label="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-5 w-5" />}
        />
        <SummaryCard
          label="Active Staff"
          value={activeEmployees}
          icon={<UserCheck className="h-5 w-5" />}
          iconClassName="bg-brand-success/10 text-brand-success"
          lineClassName="bg-brand-success"
        />
        <SummaryCard
          label="Inactive / On Leave"
          value={inactiveEmployees}
          icon={<UserX className="h-5 w-5" />}
          iconClassName="bg-brand-warning/10 text-brand-warning"
          lineClassName="bg-brand-warning"
        />
      </div>
      
      {/* Quick Actions or charts can go here */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Head over to the Employees tab to register a new employee (Bharti) for your department.
        </p>
        <button onClick={() => window.location.href = '/hod/employees'} className="text-sm font-medium bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brand-primary-dark)] transition-colors">
          Manage Employees →
        </button>
      </div>
    </div>
  );
}
