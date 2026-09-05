// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, CalendarCheck, Package, Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { employeeApi } from "@/services/employeeApi.service";
import { attendanceService } from "@/services/attendance.service";
import { ticketService } from "@/services/ticket.service";
import { assetService } from "@/services/asset.service";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboard.service";
import { AnalogClock } from "@/components/ui/analog-clock";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function HodDashboardClientPage() {
  const { user } = useAuth();

    const [currentDate, setCurrentDate] = useState("");
  const [timeObj, setTimeObj] = useState<Date | null>(null);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }));
      setTimeObj(now);
      
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 17) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const deptName = user?.employee?.department?.name || user?.departmentName || "";
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: dashboardInfo, isLoading: loadingDash } = useQuery({
    queryKey: ["hod-dashboard", deptName],
    queryFn: () => dashboardService.getHodDashboard(deptName),
    enabled: !!deptName
  });

  const isLoading = !deptName || loadingDash;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const data = dashboardInfo || {};
  const stats = data.stats || { totalEmployees: 0, presentToday: 0, totalAssets: 0, activeTickets: 0 };
  const totalEmployees = stats.totalEmployees;
  const presentToday = stats.presentToday;
  
  const totalAssets = stats.totalAssets;
  const activeTickets = stats.activeTickets;

  const recentTickets = data.recentTickets || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-red-100 text-red-700 border-red-200";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700 border-blue-200";
      case "RESOLVED": return "bg-green-100 text-green-700 border-green-200";
      case "CLOSED": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "text-red-500 bg-red-50";
      case "MEDIUM": return "text-orange-500 bg-orange-50";
      case "LOW": return "text-green-500 bg-green-50";
      default: return "text-slate-500 bg-slate-50";
    }
  };

  // Chart Data
  const ticketStatusData = data.chartData?.ticketStatusData || [];
  const employeeDesigData = data.chartData?.employeeDesigData || [];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#ef4444'];

  const firstName = user?.employee?.firstName || user?.fullName?.split(" ")[0] || "HOD";

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-sidebar)] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{greeting}, {firstName}! 👋</h1>
            <p className="text-white/80 text-lg">Here is what is happening in the {deptName} department today.</p>
          </div>
          
          <div className="flex items-center gap-4 sm:justify-end z-20 bg-black/10 pr-3 pl-5 py-2.5 rounded-[50px] backdrop-blur-sm border border-white/10 shadow-inner">
            <div className="text-right text-white/90 font-medium">
              <p className="text-lg font-bold">{currentDate}</p>
              {timeObj && <p className="text-sm opacity-90 mt-0.5 tracking-wider font-mono">{timeObj.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}</p>}
            </div>
            {timeObj && <AnalogClock date={timeObj} className="shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]" style={{ width: 130, height: 130, marginTop: "-25px", marginBottom: "-25px", marginRight: "-5px" }} />}
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-top-left -translate-x-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-2xl p-6 border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
            <h3 className="text-2xl font-bold">{totalEmployees}</h3>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Present Today</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{presentToday}</h3>
              <span className="text-xs text-muted-foreground">/ {totalEmployees}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
            <h3 className="text-2xl font-bold">{totalAssets}</h3>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Tickets</p>
            <h3 className="text-2xl font-bold">{activeTickets}</h3>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Tickets by Status */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Tickets by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Employees by Designation */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Employees by Designation</h3>
          <div className="h-64">
            {employeeDesigData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeeDesigData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {employeeDesigData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">Recent IT Tickets</h3>
                <p className="text-sm text-muted-foreground">Latest requests raised by your team</p>
              </div>
              <Link href={`/hod/${deptName.toLowerCase().replace(/ /g, "-")}/tickets`}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed bg-slate-50">
                  No tickets raised recently.
                </div>
              ) : (
                recentTickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-lg ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === "HIGH" ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-semibold">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{ticket.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{format(new Date(ticket.createdAt), "MMM d, h:mm a")}</span>
                          <span>•</span>
                          <span>By: {ticket.raisedByEmployee ? `${ticket.raisedByEmployee.firstName} ${ticket.raisedByEmployee.lastName}` : "Employee"}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-1">Today's Attendance</h3>
            <p className="text-sm text-muted-foreground mb-6">{format(new Date(), "EEEE, MMMM do")}</p>
            
            {totalEmployees === 0 ? (
              <p className="text-sm text-center text-muted-foreground">No employees found.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500"/> Present</span>
                    <span className="font-bold">{presentToday}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(presentToday / totalEmployees) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700 flex items-center gap-2"><UserCheck className="h-4 w-4 text-slate-400"/> Not Marked</span>
                    <span className="font-bold">{totalEmployees - presentToday}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full transition-all" style={{ width: `${((totalEmployees - presentToday) / totalEmployees) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t">
              <Link href={`/hod/${deptName.toLowerCase().replace(/ /g, "-")}/attendance`}>
                <Button variant="secondary" className="w-full">Manage Attendance</Button>
              </Link>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href={`/hod/${deptName.toLowerCase().replace(/ /g, "-")}/employees`} className="flex items-center justify-between p-3 rounded-lg border hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-md group-hover:bg-white"><Users className="h-4 w-4 text-slate-600 group-hover:text-[var(--brand-primary)]" /></div>
                  <span className="text-sm font-medium">View Employees</span>
                </div>
              </Link>
              <Link href={`/hod/${deptName.toLowerCase().replace(/ /g, "-")}/assets`} className="flex items-center justify-between p-3 rounded-lg border hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-md group-hover:bg-white"><Package className="h-4 w-4 text-slate-600 group-hover:text-[var(--brand-primary)]" /></div>
                  <span className="text-sm font-medium">View Assigned Assets</span>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
