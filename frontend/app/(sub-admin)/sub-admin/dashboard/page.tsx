import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sub Admin Dashboard | DR IT GROUP",
};

export default function SubAdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sub Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! You can manage your assigned departments and create Heads of Departments (HODs) here.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold mb-2">Manage Your Departments</h2>
        <p className="text-muted-foreground mb-6">
          Head over to the Departments section to view the departments assigned to you by the Super Admin, and create HODs for them.
        </p>
        <a 
          href="/sub-admin/department" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)] h-10 py-2 px-4"
        >
          Go to My Departments
        </a>
      </div>
    </div>
  );
}
