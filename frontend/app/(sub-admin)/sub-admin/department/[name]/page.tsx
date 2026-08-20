import { Metadata } from "next";
import SubAdminDepartmentDetailClientPage from "@/components/features/sub-admins/SubAdminDepartmentDetailClientPage";

export const metadata: Metadata = {
  title: "Department Details | DR IT GROUP",
};

export default async function SubAdminDepartmentDetailPage({ params }: { params: Promise<{ name: string }> }) {
  // Await the params object in Next.js 15
  const resolvedParams = await params;
  const deptName = decodeURIComponent(resolvedParams.name);
  
  return <SubAdminDepartmentDetailClientPage departmentName={deptName} />;
}
