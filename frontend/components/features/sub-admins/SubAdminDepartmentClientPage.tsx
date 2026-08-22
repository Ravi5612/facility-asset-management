"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { SummaryCard } from "@/components/ui/summary-card";
import { ErrorAlert } from "@/components/ui/alert-box";
import { subAdminDepartmentService } from "@/services/subAdminDepartment.service";
import { Skeleton } from "@/components/ui/skeleton";



// Department name → Icon color mapping
const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  IT: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  HR: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  Finance: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  Store: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  Security: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  Marketing: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
  Operations: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
};

function getDeptColor(name: string) {
  return (
    DEPT_COLORS[name] || {
      bg: "bg-[var(--brand-primary-light)]",
      text: "text-[var(--brand-primary)]",
      border: "border-[var(--brand-primary)]/20",
    }
  );
}

export default function SubAdminDepartmentClientPage() {
  const [search, setSearch] = useState("");

  // Rule #17 — TanStack Query for API state
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-departments"],
    queryFn: subAdminDepartmentService.getMyDepartments,
  });

  // Derive filtered list from server data — Rule #11 (Minimal State)
  const filtered = useMemo(() => {
    if (!data?.departments) return [];
    if (!search.trim()) return data.departments;
    return data.departments.filter((d) =>
      d.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.departments, search]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-md">
          <Skeleton className="h-[104px] w-full rounded-xl" />
          <Skeleton className="h-[104px] w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error instanceof Error ? error.message : "Failed to load departments"} />;
  }

  const total = data?.departments?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Departments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Departments assigned to you by the Super Admin.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-md">
        <SummaryCard
          label="Assigned Departments"
          value={total}
          icon={<Building2 className="h-5 w-5" />}
        />
        <SummaryCard
          label="Total Access"
          value={total > 0 ? "Active" : "None"}
          icon={<Users className="h-5 w-5" />}
          iconClassName="bg-brand-success/10 text-brand-success"
          lineClassName="bg-brand-success"
        />
      </div>

      {/* Search */}
      {total > 0 && (
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search departments..."
          className="max-w-sm"
        />
      )}

      {/* Department Cards — same style as Super Admin */}
      {filtered.length === 0 && total === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border rounded-xl bg-card text-muted-foreground gap-3">
          <Building2 className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">No departments assigned yet.</p>
          <p className="text-xs">Contact your Super Admin to get department access.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          No departments match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((deptName) => {
            const color = getDeptColor(deptName);
            return (
              <div
                key={deptName}
                className={`bg-card border ${color.border} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 relative overflow-hidden group`}
              >
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${color.bg.replace("bg-", "bg-").replace("50", "400")}`} />

                {/* Icon + Name */}
                <div className="flex items-center gap-3 pt-2">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color.bg} ${color.border} border`}>
                    <Building2 className={`h-5 w-5 ${color.text}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">
                      {deptName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Department
                    </p>
                  </div>
                </div>

                {/* Access Badge & Action */}
                <div className={`flex items-center justify-between gap-2 mt-auto`}>
                  <div className={`flex items-center gap-2 ${color.bg} rounded-lg px-3 py-1.5`}>
                    <span className={`text-xs font-semibold ${color.text}`}>
                      ✓ Full Access
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => window.location.href = `/sub-admin/department/${deptName.toLowerCase()}`}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${color.border} hover:${color.bg} ${color.text} transition-colors`}
                  >
                    Manage →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
