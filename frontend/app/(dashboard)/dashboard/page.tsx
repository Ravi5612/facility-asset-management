"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total Assets",      value: "1,248", icon: "📦", color: "bg-purple-100 text-purple-600", line: "bg-purple-500", trend: "+12 from last month" },
          { label: "Total Users",       value: "342",   icon: "👥", color: "bg-blue-100 text-blue-600",     line: "bg-blue-500",   trend: "+8 from last month" },
          { label: "Open Tickets",      value: "28",    icon: "🎫", color: "bg-orange-100 text-orange-600", line: "bg-orange-500", trend: "8 new today" },
          { label: "Today's Visitors",  value: "16",    icon: "👤", color: "bg-green-100 text-green-600",   line: "bg-green-500",  trend: "5 pending" },
          { label: "Total Departments", value: "7",     icon: "🏢", color: "bg-pink-100 text-pink-600",     line: "bg-pink-500",   trend: "View all departments" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative rounded-xl bg-card p-5 shadow-sm border border-border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            {/* Hover bottom line */}
            <div
              className={`absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-300 rounded-b-xl ${stat.line}`}
            />

            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="mt-5 text-3xl font-extrabold text-slate-800">{stat.value}</p>
            <p className="mt-2.5 text-sm font-semibold text-slate-600">{stat.label}</p>
            <p className="mt-2.5 text-sm font-medium text-[var(--brand-success)]">{stat.trend}</p>
          </div>
        ))}
      </div>

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
              { label: "IT Assets", percent: 62, count: 773, color: "bg-purple-500" },
              { label: "HR Assets", percent: 24, count: 299, color: "bg-blue-400" },
              { label: "Store Assets", percent: 14, count: 176, color: "bg-teal-400" },
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
              { label: "Open", count: 12, color: "text-blue-600 bg-blue-50" },
              { label: "In Progress", count: 8, color: "text-orange-600 bg-orange-50" },
              { label: "Pending", count: 5, color: "text-yellow-600 bg-yellow-50" },
              { label: "Resolved", count: 45, color: "text-green-600 bg-green-50" },
              { label: "Critical", count: 3, color: "text-red-600 bg-red-50" },
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
              { label: "Available", count: 262, dot: "bg-green-500" },
              { label: "Assigned", count: 986, dot: "bg-blue-500" },
              { label: "Under Repair", count: 24, dot: "bg-orange-500" },
              { label: "Out of Service", count: 11, dot: "bg-red-500" },
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
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={assetTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                labelStyle={{ color: "#1e293b" }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Total Assets" 
                stroke="#1553cc" 
                strokeWidth={2}
                dot={{ fill: "#1553cc", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Available" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets Status Bar Chart */}
        <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Tickets by Status</h2>
            <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">View All</button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ticketStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="status" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                labelStyle={{ color: "#1e293b" }}
              />
              <Bar dataKey="count" fill="#1553cc" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Assets Pie Chart */}
      <div className="rounded-xl bg-card p-7 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-800">Assets by Department</h2>
          <button className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">Details</button>
        </div>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                labelStyle={{ color: "#1e293b" }}
              />
            </PieChart>
          </ResponsiveContainer>
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

const pieColors = ["#1553cc", "#10b981", "#f59e0b"]
