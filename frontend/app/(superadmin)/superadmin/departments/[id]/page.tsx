import { DepartmentDetailClientPage } from "@/components/features/departments/DepartmentDetailClientPage";

export default async function DepartmentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <DepartmentDetailClientPage departmentId={params.id} />;
}
