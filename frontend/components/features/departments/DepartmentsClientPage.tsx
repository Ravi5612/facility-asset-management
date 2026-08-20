"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/ui/summary-card";
import { SearchInput } from "@/components/ui/search-input";
import { Building2, Users, Plus, Loader2 } from "lucide-react";
import { departmentService } from "@/services/department.service";
import CreateDepartmentModal from "@/components/features/users/CreateDepartmentModal";
import { DepartmentGrid } from "@/components/features/departments/DepartmentGrid";

export function DepartmentsClientPage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
  });

  const filteredData = departments?.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your organization's departments.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white">
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SummaryCard 
          label="Total Departments"
          value={departments?.length || 0}
          icon={<Building2 className="h-5 w-5" />}
        />
        <SummaryCard 
          label="Total Employees"
          value={departments?.reduce((acc, d) => acc + (d.employeeCount || 0), 0) || 0}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-card p-4 rounded-xl border">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search departments..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 border rounded-xl bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DepartmentGrid departments={filteredData as any} />
      )}

      {isAddOpen && <CreateDepartmentModal onClose={() => setIsAddOpen(false)} />}
    </div>
  );
}
