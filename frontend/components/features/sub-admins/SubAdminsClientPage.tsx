"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SubAdminTable from "@/components/features/sub-admins/SubAdminTable";
import SubAdminModal from "@/components/features/sub-admins/SubAdminModal";
import { SubAdminFormValues } from "@/lib/validations/subadmin";
import { SubAdmin } from "@/types";
import { Shield, UserCheck, UserX } from "lucide-react";
import { ErrorAlert } from "@/components/ui/alert-box";
import { subAdminApiService, SubAdminUser } from "@/services/subAdminApi.service";
import { PasswordVerificationDialog } from "@/components/features/auth/PasswordVerificationDialog";
import { ResetPasswordDialog } from "@/components/features/auth/ResetPasswordDialog";

import { SummaryCard } from "@/components/ui/summary-card";
import { Skeleton } from "@/components/ui/skeleton";



export function SubAdminsClientPage() {
  const queryClient = useQueryClient();
  
  const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);

  // Security flow states
  type ActionPayload = 
    | { action: "EDIT"; admin: SubAdmin }
    | { action: "TOGGLE"; id: string; currentStatus: "Active" | "Inactive" }
    | { action: "DELETE"; id: string }
    | { action: "RESET_PWD"; id: string };
    
  const [pendingAction, setPendingAction] = useState<ActionPayload | null>(null);
  const [showPasswordVerify, setShowPasswordVerify] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState<string | null>(null);

  const executeAction = async () => {
    if (!pendingAction) return;
    
    setShowPasswordVerify(false);

    if (pendingAction.action === "EDIT") {
      setEditingAdmin(pendingAction.admin);
    } else if (pendingAction.action === "TOGGLE") {
      await handleToggleStatus(pendingAction.id);
    } else if (pendingAction.action === "DELETE") {
      await handleDeleteSubAdmin(pendingAction.id);
    } else if (pendingAction.action === "RESET_PWD") {
      setShowResetPassword(pendingAction.id);
    }
    
    setPendingAction(null);
  };

  const requestAction = (payload: ActionPayload) => {
    setPendingAction(payload);
    setShowPasswordVerify(true);
  };


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


  const updateMutation = useMutation({
    mutationFn: (vars: { id: string, data: any }) => subAdminApiService.updateSubAdmin(vars.id, vars.data),
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
      await updateMutation.mutateAsync({
        id: editingAdmin.id,
        data: {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          departmentIds: formData.departments,
        }
      });
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
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>

        <div className="border rounded-lg bg-card shadow-sm p-4 mt-6">
          <div className="flex gap-4 border-b pb-4 mb-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={`skeleton-${num}`} className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Define errors cleanly
  const errorMessage =
    error instanceof Error
      ? error.message
      : createMutation.error?.message ||
        updateMutation.error?.message ||
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
          onEdit={(admin) => requestAction({ action: "EDIT", admin })}
          onDelete={(id) => requestAction({ action: "DELETE", id })}
          onToggleStatus={(id, status) => requestAction({ action: "TOGGLE", id, currentStatus: status })}
            onResetPassword={(id) => requestAction({ action: "RESET_PWD", id })}
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
    
      {/* Security Modals */}
      <PasswordVerificationDialog
        isOpen={showPasswordVerify}
        onClose={() => {
          setShowPasswordVerify(false);
          setPendingAction(null);
        }}
        onSuccess={executeAction}
        actionName={pendingAction?.action === "RESET_PWD" ? "Reset Password" : pendingAction?.action.toLowerCase() || "action"}
      />
      {showResetPassword && (
        <ResetPasswordDialog
          isOpen={true}
          userId={showResetPassword}
          onClose={() => setShowResetPassword(null)}
        />
      )}
</div>
  );
}
