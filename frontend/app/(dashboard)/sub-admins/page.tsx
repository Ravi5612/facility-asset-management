"use client";

import { useEffect, useState } from "react";
import SubAdminTable from "@/components/features/sub-admins/SubAdminTable";
import SubAdminModal from "@/components/features/sub-admins/SubAdminModal";
import { subAdminService, SubAdmin } from "@/services/subAdmin.service";
import { SubAdminFormValues } from "@/lib/validations/subadmin";
import { Loader2 } from "lucide-react";

export default function SubAdminsPage() {
  const [data, setData] = useState<SubAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial mock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const admins = await subAdminService.getSubAdmins();
        setData(admins);
      } catch (error) {
        console.error("Failed to fetch sub admins", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle new sub admin creation
  const handleAddSubAdmin = async (formData: SubAdminFormValues) => {
    // Call the mock service
    const newAdmin = await subAdminService.addSubAdmin({
      name: formData.name,
      email: formData.email,
      departments: formData.departments,
      status: formData.status as "Active" | "Inactive",
    });

    // Update local state to reflect the new addition immediately
    setData((prev) => [newAdmin, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sub Admins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage sub-administrator accounts and their department access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SubAdminModal onSuccess={handleAddSubAdmin} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 border rounded-lg bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <SubAdminTable data={data} />
      )}
    </div>
  );
}
