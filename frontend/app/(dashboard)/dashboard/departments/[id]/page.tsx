"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft, ChevronRight, Search, Users, Building2, Eye, Filter, ArrowUpDown, FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockDepartments } from "../data";

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const department = useMemo(() => mockDepartments.find(d => d.id === id), [id]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Department Not Found</h2>
        <p className="text-muted-foreground">The department you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard/departments")}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Departments
        </Button>
      </div>
    );
  }

  const filteredEmployees = department.employees.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                        emp.email.toLowerCase().includes(search.toLowerCase()) ||
                        emp.id.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || emp.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* ── Header Area ── */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/departments")} className="shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{department.name}</h1>
            <Badge variant="secondary" className={department.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
              {department.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
            <span className="font-mono">{department.id}</span>
            <span>·</span>
            <span>HOD: <strong className="text-foreground">{department.hod}</strong></span>
          </p>
        </div>
      </div>

      {/* ── Top Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><Users className="h-5 w-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Employees</p>
            <p className="text-2xl font-bold">{department.employeeCount}</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-3 rounded-full"><Users className="h-5 w-5" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Employees</p>
            <p className="text-2xl font-bold">{department.employees.filter(e => e.status === "Active").length}</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm md:col-span-2">
          <p className="text-sm text-muted-foreground font-medium mb-1">Department Description</p>
          <p className="text-sm text-foreground">{department.description}</p>
        </div>
      </div>

      {/* ── Employee Table Section ── */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold">Employee Directory</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-[250px] bg-background" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none">
              <option value="All">All Roles</option>
              <option value="Manager">Manager</option>
              <option value="Senior Executive">Senior Executive</option>
              <option value="Executive">Executive</option>
            </select>
            <Button variant="outline" className="gap-2 bg-background"><Filter className="h-4 w-4" /> Filter</Button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">Employee Info</th>
                <th className="px-4 py-3">Role & Status</th>
                <th className="px-4 py-3">Assigned Assets</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Performance</th>
                <th className="px-4 py-3">Salary</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No employees found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                    {/* Employee Info */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{emp.id}</p>
                      <p className="text-xs text-blue-600 hover:underline cursor-pointer mt-0.5">{emp.email}</p>
                    </td>
                    
                    {/* Role & Status */}
                    <td className="px-4 py-3">
                      <p className="font-semibold mb-1">{emp.role}</p>
                      <Badge variant="secondary" className={`text-[10px] py-0 h-5 ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {emp.status}
                      </Badge>
                    </td>

                    {/* Assets */}
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="gap-1 font-mono">
                        <FileText className="h-3 w-3" /> {emp.assetsAssigned} Items
                      </Badge>
                    </td>

                    {/* Attendance */}
                    <td className="px-4 py-3">
                      <span className={`font-bold ${parseInt(emp.attendance || "0") >= 95 ? "text-green-600" : "text-orange-600"}`}>
                        {emp.attendance}
                      </span>
                    </td>

                    {/* Performance */}
                    <td className="px-4 py-3">
                       <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          emp.performance === "Excellent" ? "bg-purple-100 text-purple-700" :
                          emp.performance === "Needs Improvement" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                       }`}>
                         {emp.performance}
                       </span>
                    </td>

                    {/* Salary */}
                    <td className="px-4 py-3 font-mono">
                      {emp.salary}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-[var(--brand-primary)] hover:bg-blue-50">
                        View Record <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="p-4 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between items-center">
          <p>Showing {filteredEmployees.length} out of {department.employeeCount} employees</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
