// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, Users, Building2, UserX, Filter
} from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmployeeAssetsModal } from "./EmployeeAssetsModal";
import { EmployeeAttendanceModal } from "./EmployeeAttendanceModal";
import { useQuery } from "@tanstack/react-query";
import { departmentService } from "@/services/department.service";
import type { Employee } from "@/types";
import { EMPLOYEE_STATUS } from "@/lib/constants";
import { DepartmentDetailSkeleton } from "@/components/ui/DepartmentDetailSkeleton";



export function DepartmentDetailClientPage({ departmentId }: { departmentId: string }) {
  const router = useRouter();

  const { data: department, isLoading } = useQuery({
    queryKey: ["department", departmentId],
    queryFn: () => departmentService.getDepartmentById(departmentId),
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  if (isLoading) {
    return <DepartmentDetailSkeleton />;
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Department Not Found</h2>
        <p className="text-muted-foreground">The department you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push("/superadmin/departments")}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Departments
        </Button>
      </div>
    );
  }

  const filteredEmployees = department.employees.filter((emp: Employee) => {
    const matchSearch = emp.name?.toLowerCase().includes(search.toLowerCase()) || 
                        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
                        emp.id?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || emp.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/superadmin/departments")} className="h-8 w-8 p-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-[var(--brand-primary)]" />
              {department.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Code: <span className="font-mono">{department.code}</span> • HOD: <span className="font-semibold">{department.hod}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Department Overview</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {department.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-muted-foreground font-semibold mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-foreground">{department.employees.length}</p>
              </div>
              <div className="bg-brand-primary/10 text-brand-primary p-3.5 rounded-xl border border-brand-primary/20">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="bg-card border rounded-lg p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-muted-foreground font-semibold mb-1">Active Employees</p>
                <p className="text-3xl font-bold text-brand-success">{department.employees.filter((e: Employee) => e.status?.toLowerCase() === EMPLOYEE_STATUS.ACTIVE.toLowerCase()).length}</p>
              </div>
              <div className="bg-brand-success/10 text-brand-success p-3.5 rounded-xl border border-brand-success/20">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="bg-card border rounded-lg p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-muted-foreground font-semibold mb-1">Inactive Employees</p>
                <p className="text-3xl font-bold text-brand-danger">{department.employees.filter((e: Employee) => e.status?.toLowerCase() === EMPLOYEE_STATUS.INACTIVE.toLowerCase()).length}</p>
              </div>
              <div className="bg-brand-danger/10 text-brand-danger p-3.5 rounded-xl border border-brand-danger/20">
                <UserX className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Employee Directory</h2>
              <div className="flex gap-2">
                <SearchInput
                  value={search}
                  onChange={(v) => setSearch(v)}
                  placeholder="Search employee..."
                  className="w-[250px]"
                />
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none">
                  <option value="All">All Roles</option>
                  {Array.from(new Set(department.employees.map((e: Employee) => e.role).filter(Boolean))).map(role => (
                    <option key={role as string} value={role as string}>{role as string}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 min-w-[200px]">Employee Info</th>
                    <th className="px-4 py-3">Role & Status</th>
                    <th className="px-4 py-3">Assigned Assets</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No employees found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp: Employee) => (
                      <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-foreground">{emp.name || `${(emp as any).firstName} ${(emp as any).lastName}`}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{emp.employeeCode || emp.id}</p>
                          <a href={`mailto:${emp.email}`} className="text-xs text-blue-600 hover:underline mt-0.5 block">{emp.email}</a>
                        </td>
                        
                        <td className="px-4 py-3">
                          <p className="font-semibold mb-1">{emp.role || "Employee"}</p>
                          <StatusBadge status={emp.status} size="sm" />
                        </td>

                        <td className="px-4 py-3">
                          <EmployeeAssetsModal employee={emp} />
                        </td>

                        <td className="px-4 py-3">
                          <EmployeeAttendanceModal employee={emp} />
                        </td>

                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              emp.performance === "Excellent" ? "bg-brand-info/10 text-brand-info" :
                              emp.performance === "Needs Improvement" ? "bg-brand-danger/10 text-brand-danger" :
                              "bg-brand-primary/10 text-brand-primary"
                          }`}>
                            {emp.performance || "Good"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between items-center">
              <p>Showing {filteredEmployees.length} out of {department.employeeCount} employees</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
