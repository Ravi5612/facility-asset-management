import { HodAttendanceClientPage } from "@/components/features/attendance/HodAttendanceClientPage";

export default function AttendancePage({ params }: { params: { dept: string } }) {
  return <HodAttendanceClientPage deptSlug={params.dept} />;
}
