"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import {
  AssetTrendChart,
  TicketStatusBarChart,
  DepartmentAssetsPieChart,
} from "@/components/features/dashboard/DashboardCharts";
import { DashboardStatsGrid } from "@/components/features/dashboard/DashboardStatsGrid";
import { DashboardSkeleton } from "@/components/ui/skeletons";

export function DashboardClientPage() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["superadmin-dashboard"],
    queryFn: () => dashboardService.getSuperadminDashboard(),
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="space-y-2 mb-8">
          <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !dashboardData) {
    return <div className="text-red-500">Failed to load dashboard data.</div>;
  }

  const { greeting, stats, assetDistribution, ticketOverview, assetStatus, chartData } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
            {greeting}, Super Admin! 👋
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
      <DashboardStatsGrid statsData={stats} />

      {/* Content Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Asset Distribution */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Asset Distribution</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">View Details</button>
          </div>
          <div className="space-y-5">
            {assetDistribution.map((item: any, idx: number) => {
              const color = idx === 0 ? "bg-brand-primary" : idx === 1 ? "bg-brand-info" : "bg-brand-success";
              return (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2.5">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{item.percent}% ({item.count})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Ticket Overview */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Ticket Overview</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">View All Tickets</button>
          </div>
          <div className="space-y-4.5">
            {ticketOverview.map((item: any) => (
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
            {assetStatus.map((item: any) => (
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
          <AssetTrendChart data={chartData.assetTrendData} />
        </div>

        {/* Tickets Status Bar Chart */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Tickets by Status</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">View All</button>
          </div>
          <TicketStatusBarChart data={chartData.ticketStatusData} />
        </div>
      </div>

      {/* Department Assets Pie Chart */}
      <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-800">Assets by Department</h2>
          <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">Details</button>
        </div>
        <div className="flex justify-center">
          <DepartmentAssetsPieChart data={chartData.departmentData} colors={["var(--brand-primary)", "var(--brand-success)", "var(--brand-warning)", "var(--brand-info)", "var(--brand-danger)"]} />
        </div>
      </div>
    </div>
  );
}
