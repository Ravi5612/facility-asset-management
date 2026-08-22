"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, UserPlus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { hodApi } from "@/services/hodApi.service";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/alert-box";
import { StatusBadge } from "@/components/ui/status-badge";
import CreateHodModal from "./CreateHodModal";
import EditHodModal from "./EditHodModal";
import { Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";



export default function SubAdminDepartmentDetailClientPage({ departmentName }: { departmentName: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHod, setEditingHod] = useState<Record<string, unknown>>(null);

  // Capitalize name for display
  const displayName = departmentName.charAt(0).toUpperCase() + departmentName.slice(1);

  const { data: hods, isLoading, error } = useQuery({
    queryKey: ["hods"],
    queryFn: hodApi.getHods,
  });

  // Filter HODs for this department
  const deptHods = hods?.filter(h => h.departmentName?.toLowerCase() === departmentName.toLowerCase()) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/sub-admin/department")} className="h-9 w-9 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[var(--brand-primary)]" />
            {displayName} Department
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Heads of Department (HODs) for {displayName}.
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white">
            <UserPlus className="h-4 w-4" /> Create HOD
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-xl border bg-card shadow-sm p-4 space-y-4">
          <div className="flex gap-4 border-b pb-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-2">
              <Skeleton className="h-12 w-full rounded-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (

        <ErrorAlert message="Failed to load HODs" />
      ) : deptHods.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border rounded-xl bg-card text-muted-foreground gap-3">
          <UserPlus className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">No HOD assigned yet.</p>
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>Assign HOD</Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Employee Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deptHods.map(hod => (
                <tr key={hod.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {hod.profileImage ? (
                          <img src={hod.profileImage} alt={hod.name || "HOD"} className="h-8 w-8 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-xs border border-[var(--brand-primary)]/20">
                            {(hod.name || hod.email || "H").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-foreground capitalize">{hod.name || "-"}</span>
                      </div>
                    </td>
                  <td className="px-6 py-4">{hod.email}</td>
                  <td className="px-6 py-4 font-mono text-xs">{hod.employeeCode || "-"}</td>
                  <td className="px-6 py-4"><StatusBadge status={hod.status === "ACTIVE" ? "Active" : "Inactive"} /></td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(hod.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditingHod(hod)}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {editingHod && (
        <EditHodModal 
          hod={editingHod}
          departmentName={displayName} 
          onClose={() => setEditingHod(null)} 
          onSuccess={() => {
            setEditingHod(null);
            queryClient.invalidateQueries({ queryKey: ["hods"] });
          }} 
        />
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <CreateHodModal 
          departmentName={displayName} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["hods"] });
          }} 
        />
      )}
    </div>
  );
}
