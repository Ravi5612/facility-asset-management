"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus } from "lucide-react";
import { employeeApi } from "@/services/employeeApi.service";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/alert-box";
import { StatusBadge } from "@/components/ui/status-badge";
import RegisterEmployeeModal from "./RegisterEmployeeModal";
import { TableSkeleton } from "@/components/ui/skeletons";



export default function HodEmployeesClientPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHr, setIsHr] = useState(false);
  
  React.useEffect(() => {
    async function checkHrStatus() {
      // 1. Try local storage first for immediate rendering
      try {
        const authData = localStorage.getItem("auth_user");
        if (authData) {
          const user = JSON.parse(authData);
          if (user?.departmentName) {
            const dept = user.departmentName.toLowerCase();
            if (dept === "hr" || dept.includes("human resource")) {
              setIsHr(true);
            }
          }
        }
      } catch (e) {}

      // 2. Always fetch fresh profile to be safe (in case localStorage is stale)
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // Backend returns { success: true, user: { ... } }
          const fetchedUser = data.user || data;
          const dept = (fetchedUser.departmentName || "").toLowerCase();
          
          console.log("Fetched HOD Department:", dept);

          if (dept === "hr" || dept.includes("human resource")) {
            setIsHr(true);
            // Optionally update local storage
            const authData = localStorage.getItem("auth_user");
            if (authData) {
              const user = JSON.parse(authData);
              user.departmentName = fetchedUser.departmentName;
              localStorage.setItem("auth_user", JSON.stringify(user));
            }
          } else {
            setIsHr(false); // Make sure it's correct
          }
        }
      } catch (e) {}
    }

    checkHrStatus();
  }, []);

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeApi.getEmployees,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--brand-primary)]" />
            Employees
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your department's workforce.
          </p>
        </div>
        {isHr && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white">
            <UserPlus className="h-4 w-4" /> Register Employee
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 border rounded-xl bg-card">
          <TableSkeleton />
        </div>
      ) : error ? (
        <ErrorAlert message="Failed to load employees" />
      ) : !employees || employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border rounded-xl bg-card text-muted-foreground gap-3">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">No employees registered yet.</p>
          {isHr && (
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>Start Hiring</Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Employee Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground capitalize">{emp.name || "-"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{emp.designation || "-"}</td>
                  <td className="px-6 py-4">{emp.email}</td>
                  <td className="px-6 py-4 font-medium text-[var(--brand-primary)]">{emp.departmentName || "-"}</td>
                  <td className="px-6 py-4 font-mono text-xs">{emp.employeeCode || "-"}</td>
                  <td className="px-6 py-4"><StatusBadge status={emp.status === "ACTIVE" ? "Active" : "Inactive"} /></td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(emp.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Modal */}
      {isModalOpen && (
        <RegisterEmployeeModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["employees"] });
          }} 
        />
      )}
    </div>
  );
}
