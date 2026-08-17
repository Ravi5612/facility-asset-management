"use client";

import { useEffect, useState } from "react";
import SubAdminTable from "@/components/features/sub-admins/SubAdminTable";
import SubAdminModal from "@/components/features/sub-admins/SubAdminModal";
import { subAdminService, SubAdmin } from "@/services/subAdmin.service";
import { SubAdminFormValues } from "@/lib/validations/subadmin";
import { Loader2, AlertCircle } from "lucide-react";

export default function SubAdminsPage() {
  const [data, setData] = useState<SubAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const admins = await subAdminService.getSubAdmins();
        setData(admins);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch sub admins";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle new/updated sub admin
  const handleSaveSubAdmin = async (formData: SubAdminFormValues) => {
    try {
      setError(null);
      
      if (editingAdmin) {
        // Update existing admin
        const updatedAdmin = await subAdminService.updateSubAdmin(editingAdmin.id, {
          name: formData.name,
          email: formData.email,
          departments: formData.departments,
          status: formData.status as "Active" | "Inactive",
        });
        setData((prev) =>
          prev.map((admin) => (admin.id === editingAdmin.id ? updatedAdmin : admin))
        );
        setEditingAdmin(null);
      } else {
        // Add new admin
        const newAdmin = await subAdminService.addSubAdmin({
          name: formData.name,
          email: formData.email,
          departments: formData.departments,
          status: formData.status as "Active" | "Inactive",
        });
        setData((prev) => [newAdmin, ...prev]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save sub admin";
      setError(errorMessage);
    }
  };

  // Handle delete sub admin
  const handleDeleteSubAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sub admin?")) return;
    
    try {
      setError(null);
      await subAdminService.deleteSubAdmin(id);
      setData((prev) => prev.filter((admin) => admin.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete sub admin";
      setError(errorMessage);
    }
  };

  // Calculate stats
  const totalSubAdmins = data.length;
  const activeSubAdmins = data.filter((admin) => admin.status === "Active").length;
  const suspendedSubAdmins = totalSubAdmins - activeSubAdmins;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sub Admins</h1>
          <p className="text-sm text-muted-foreground mt-2.5">
            Manage sub-administrator accounts and their department access.
          </p>
        </div>
        <SubAdminModal
          isEdit={false}
          initialData={undefined}
          onSuccess={handleSaveSubAdmin}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {[
          {
            label: "Total Sub Admins",
            value: totalSubAdmins.toString(),
            icon: "👤",
            color: "bg-blue-100 text-blue-600",
            line: "bg-blue-500",
          },
          {
            label: "Active",
            value: activeSubAdmins.toString(),
            icon: "✅",
            color: "bg-green-100 text-green-600",
            line: "bg-green-500",
          },
          {
            label: "Suspended",
            value: suspendedSubAdmins.toString(),
            icon: "⏸️",
            color: "bg-orange-100 text-orange-600",
            line: "bg-orange-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative rounded-xl bg-card p-5 shadow-sm border border-border overflow-hidden"
          >
            {/* Hover bottom line */}
            <div
              className={`absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-300 rounded-b-xl ${stat.line}`}
            />

            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="mt-5 text-3xl font-extrabold text-slate-800">{stat.value}</p>
            <p className="mt-2.5 text-sm font-semibold text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 border rounded-lg bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <SubAdminTable
          data={data}
          onEdit={(admin) => setEditingAdmin(admin)}
          onDelete={handleDeleteSubAdmin}
        />
      )}

      {/* Edit Modal */}
      {editingAdmin && (
        <SubAdminModal
          isEdit={true}
          initialData={editingAdmin}
          onSuccess={(formData) => {
            handleSaveSubAdmin(formData);
            setEditingAdmin(null);
          }}
          onCancel={() => setEditingAdmin(null)}
        />
      )}
    </div>
  );
}
