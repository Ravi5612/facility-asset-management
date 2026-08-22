import { EmployeeDashboardClient } from "@/components/features/employee/EmployeeDashboardClient";

export const metadata = {
  title: "Dashboard | Employee Portal",
  description: "View your personal details, attendance, assets, and raise tickets.",
};

export default function EmployeeDashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
      <EmployeeDashboardClient />
    </div>
  );
}
