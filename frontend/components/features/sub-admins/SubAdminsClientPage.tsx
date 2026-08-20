"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SubAdminTable from "@/components/features/sub-admins/SubAdminTable";
import SubAdminModal from "@/components/features/sub-admins/SubAdminModal";
import { SubAdminFormValues } from "@/lib/validations/subadmin";
import { SubAdmin } from "@/types";
import { Loader2, Shield, UserCheck, UserX } from "lucide-react";
import { ErrorAlert } from "@/components/ui/alert-box";
import { subAdminApiService, SubAdminUser } from "@/services/subAdminApi.service";
import { SummaryCard } from "@/components/ui/summary-card";

export function SubAdminsClientPage() {
  const queryClient = useQueryClient();
  const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);

  // ── 1. Fetch using TanStack Query (Rule #17) ──────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["sub-admins"],
    queryFn: subAdminApiService.getSubAdmins,
  });

  // Map backend response to frontend SubAdmin type safely
  const mappedData: SubAdmin[] = (data || []).map((u: SubAdminUser) => ({
    id: u.id,
    employeeCode: u.employeeCode || "N/A",
    name: u.name || u.email.split("@")[0],
    email: u.email,
    status: u.status === "ACTIVE" ? "Active" : "Inactive",
    departments: u.departments || [],
    createdAt: u.createdAt,
    assignedAssets: u.assignedAssets || 0,
    profileImage: u.profileImage || undefined,
  }));

  // ── 2. Mutations ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: subAdminApiService.createSubAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: subAdminApiService.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subAdminApiService.deleteSubAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveSubAdmin = async (formData: SubAdminFormValues) => {
    if (editingAdmin) {
      await toggleMutation.mutateAsync(editingAdmin.id);
      setEditingAdmin(null);
    } else {
      await createMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password || "",
        departmentIds: formData.departments,
        profileImage: formData.profileImage instanceof File ? formData.profileImage : undefined,
      });
    }
  };

  const handleDeleteSubAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sub admin?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const handleToggleStatus = async (id: string) => {
    await toggleMutation.mutateAsync(id);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const totalSubAdmins = mappedData.length;
  const activeSubAdmins = mappedData.filter((a) => a.status === "Active").length;
  const inactiveSubAdmins = totalSubAdmins - activeSubAdmins;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading sub-admins...</span>
      </div>
    );
  }

  // Define errors cleanly
  const errorMessage =
    error instanceof Error
      ? error.message
      : createMutation.error?.message ||
        toggleMutation.error?.message ||
        deleteMutation.error?.message;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sub Admins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage sub-administrator accounts and their department access.
          </p>
        </div>
        <SubAdminModal
          isEdit={false}
          initialData={undefined}
          onSuccess={handleSaveSubAdmin}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <SummaryCard label="Total Sub Admins" value={totalSubAdmins} icon={<Shield className="h-5 w-5" />} />
        <SummaryCard label="Active" value={activeSubAdmins} icon={<UserCheck className="h-5 w-5" />} />
        <SummaryCard label="Inactive" value={inactiveSubAdmins} icon={<UserX className="h-5 w-5" />} />
      </div>

      {errorMessage && <ErrorAlert message={errorMessage} />}

      <div className="border rounded-lg bg-card shadow-sm">
        <SubAdminTable
          data={mappedData}
          onEdit={setEditingAdmin}
          onDelete={handleDeleteSubAdmin}
          onToggleStatus={async (id) => handleToggleStatus(id)}
        />
      </div>

      {editingAdmin && (
        <SubAdminModal
          isEdit={true}
          initialData={editingAdmin}
          onSuccess={async (formData) => {
            await handleSaveSubAdmin(formData);
          }}
          onCancel={() => setEditingAdmin(null)}
        />
      )}
    </div>
  );
}
