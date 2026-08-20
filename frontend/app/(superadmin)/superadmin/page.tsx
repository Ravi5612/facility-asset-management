import {
  AssetTrendChart,
  TicketStatusBarChart,
  DepartmentAssetsPieChart,
} from "@/components/features/dashboard/DashboardCharts";
import { DashboardStatsGrid } from "@/components/features/dashboard/DashboardStatsGrid";

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
            Good Morning, Super Admin! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-2.5">
            Here&apos;s an overview of your organization&apos;s facility &amp;
            asset activities.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-foreground">{currentDate}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStatsGrid />

      {/* Content Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Asset Distribution */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Asset Distribution</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">View Details</button>
          </div>
          <div className="space-y-5">
            {[
              { label: "IT Assets", percent: 62, count: 773, color: "bg-brand-primary" },
              { label: "HR Assets", percent: 24, count: 299, color: "bg-brand-info" },
              { label: "Store Assets", percent: 14, count: 176, color: "bg-brand-success" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2.5">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{item.percent}% ({item.count})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Overview */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Ticket Overview</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">View All Tickets</button>
          </div>
          <div className="space-y-4.5">
            {[
              { label: "Open", count: 12, color: "text-brand-info bg-brand-info/10" },
              { label: "In Progress", count: 8, color: "text-brand-orange bg-brand-orange/10" },
              { label: "Pending", count: 5, color: "text-brand-warning bg-brand-warning/10" },
              { label: "Resolved", count: 45, color: "text-brand-success bg-brand-success/10" },
              { label: "Critical", count: 3, color: "text-brand-danger bg-brand-danger/10" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-md ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assets Status */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Assets Status</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">View Report</button>
          </div>
          <div className="space-y-5">
            {[
              { label: "Available", count: 262, dot: "bg-brand-success" },
              { label: "Assigned", count: 986, dot: "bg-brand-primary" },
              { label: "Under Repair", count: 24, dot: "bg-brand-warning" },
              { label: "Out of Service", count: 11, dot: "bg-brand-danger" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                </div>
                <span className="text-base font-bold text-slate-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Asset Trend Line Chart */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Asset Trend (Last 6 Months)</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">Export</button>
          </div>
          <AssetTrendChart data={assetTrendData} />
        </div>

        {/* Tickets Status Bar Chart */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Tickets by Status</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">View All</button>
          </div>
          <TicketStatusBarChart data={ticketStatusData} />
        </div>
      </div>

      {/* Department Assets Pie Chart */}
      <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-800">Assets by Department</h2>
          <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">Details</button>
        </div>
        <div className="flex justify-center">
          <DepartmentAssetsPieChart data={departmentData} colors={pieColors} />
        </div>
      </div>
    </div>
  );
}

// Chart Data
const assetTrendData = [
  { month: "Jan", "Total Assets": 950, Available: 620 },
  { month: "Feb", "Total Assets": 1050, Available: 680 },
  { month: "Mar", "Total Assets": 1150, Available: 720 },
  { month: "Apr", "Total Assets": 1200, Available: 750 },
  { month: "May", "Total Assets": 1220, Available: 760 },
  { month: "Jun", "Total Assets": 1248, Available: 775 },
];

const ticketStatusData = [
  { status: "Open", count: 12 },
  { status: "In Progress", count: 8 },
  { status: "Pending", count: 5 },
  { status: "Resolved", count: 45 },
  { status: "Critical", count: 3 },
];

const departmentData = [
  { name: "IT Assets", value: 773 },
  { name: "HR Assets", value: 299 },
  { name: "Store Assets", value: 176 },
];

const pieColors = ["var(--brand-primary)", "var(--brand-success)", "var(--brand-warning)"];
