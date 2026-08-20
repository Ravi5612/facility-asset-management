import { Metadata } from "next";
import SubAdminDepartmentClientPage from "@/components/features/sub-admins/SubAdminDepartmentClientPage";

export const metadata: Metadata = {
  title: "My Departments | DR IT GROUP",
};

// Rule #8 — Server Component (no "use client") as default
export default function SubAdminDepartmentPage() {
  return <SubAdminDepartmentClientPage />;
}
