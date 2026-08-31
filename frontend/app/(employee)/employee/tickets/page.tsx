import { EmployeeTicketsClientPage } from "@/components/features/tickets/EmployeeTicketsClientPage";

export const metadata = {
  title: "My Tickets | Employee Portal",
  description: "Manage tickets assigned to you and tickets raised by you.",
};

export default function EmployeeTicketsPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
      <EmployeeTicketsClientPage />
    </div>
  );
}
