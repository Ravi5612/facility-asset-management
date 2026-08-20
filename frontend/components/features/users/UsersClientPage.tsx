"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Shield, Eye, Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { departmentService, Department } from "@/services/department.service";
import CreateDepartmentModal from "./CreateDepartmentModal";

export function UsersClientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDeptId, setEditDeptId] = useState<string | null>(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
  });

  const deleteMutation = useMutation({
    mutationFn: departmentService.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (err) => {
      alert("Failed to delete department: " + err.message);
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users & Departments</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage company employees categorized by their respective departments.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white">
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 border rounded-xl bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments?.map((dept) => {
            return (
              <div
                key={dept.id}
                className="flex flex-col gap-4 p-5 rounded-xl border bg-card text-left transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between w-full">
                  <h3 className="font-bold text-lg text-foreground pr-2 truncate">
                    {dept.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => setEditDeptId(dept.id)}
                      className="text-muted-foreground hover:text-brand-primary transition-colors p-1"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(dept.id)}
                      className="text-muted-foreground hover:text-brand-danger transition-colors p-1"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold bg-muted text-muted-foreground ml-1">
                      {dept.employeeCount || 0}
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2.5 text-sm mt-1">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> HOD
                    </span>
                    <span className="font-semibold text-foreground truncate max-w-[150px] text-right">
                      {(dept as any).hodName ? (dept as any).hodName : "Unassigned"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Code
                    </span>
                    <span className="font-mono text-xs">{dept.code}</span>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-sm"
                    onClick={() => router.push(`/superadmin/departments/${dept.id}`)}
                  >
                    <Eye className="h-4 w-4" /> View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <CreateDepartmentModal 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
      
      {editDeptId && (
        <CreateDepartmentModal 
          editDepartmentId={editDeptId}
          onClose={() => setEditDeptId(null)} 
        />
      )}
    </div>
  );
}
