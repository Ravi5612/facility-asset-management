"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  User, 
  Calendar, 
  Clock, 
  Briefcase, 
  Building2, 
  Mail, 
  Phone, 
  Package, 
  Ticket,
  PlusCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { RaiseTicketModal } from "@/components/features/tickets/RaiseTicketModal";

export function EmployeeDashboardClient() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // --- MOCK DATA ---
  const employeeInfo = {
    name: "Rahul Sharma",
    employeeCode: "EMP-0012",
    designation: "Senior UI/UX Designer",
    department: "Design",
    email: "rahul.sharma@drithq.com",
    phone: "+91 98765 43210",
    joiningDate: "12 Aug 2024",
    profilePic: null, // Can put a URL here to test image
  };

  const attendanceStats = {
    present: 18,
    absent: 2,
    leaves: 1,
    totalWorkingDays: 21
  };

  const myAssets = [
    { id: "AST-LPT-001", name: "MacBook Pro M2", type: "Laptop", assignedOn: "15 Aug 2024", status: "Active" },
    { id: "AST-MON-042", name: "Dell 27 4K Monitor", type: "Monitor", assignedOn: "20 Aug 2024", status: "Active" },
  ];

  const myTickets = [
    { id: "TKT-001", subject: "MacBook charging issue", date: "10 Oct 2025", status: "In Progress", priority: "High" },
    { id: "TKT-015", subject: "Request for Figma Pro", date: "02 Sep 2025", status: "Completed", priority: "Medium" },
  ];

  const salaryHistory = [
    { month: "October 2025", amount: "₹ 85,000", status: "Processing", date: "-" },
    { month: "September 2025", amount: "₹ 85,000", status: "Credited", date: "30 Sep 2025" },
    { month: "August 2025", amount: "₹ 85,000", status: "Credited", date: "31 Aug 2025" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {employeeInfo.name.split(" ")[0]}! \uD83D\uDC4B
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Here's an overview of your work, assets, and requests.
          </p>
        </div>
        <Button 
          onClick={() => setIsTicketModalOpen(true)}
          className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white gap-2 shadow-lg"
        >
          <PlusCircle className="h-4 w-4" />
          Raise Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile & Attendance */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[var(--brand-primary)]/20 to-[var(--brand-sidebar)]/20" />
            <div className="relative pt-6 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-lg mb-4">
                {employeeInfo.profilePic ? (
                  <Image src={employeeInfo.profilePic} alt="Profile" fill className="object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">{employeeInfo.name}</h2>
              <p className="text-[var(--brand-primary)] font-medium text-sm">{employeeInfo.designation}</p>
              
              <div className="w-full mt-6 space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="font-medium text-foreground">{employeeInfo.department} Dept</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span className="font-medium text-foreground">{employeeInfo.employeeCode}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{employeeInfo.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{employeeInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-brand-primary" />
              <h3 className="text-lg font-bold">This Month</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-success/10 p-4 rounded-xl border border-brand-success/20">
                <p className="text-sm text-brand-success font-medium mb-1">Present</p>
                <p className="text-3xl font-bold text-foreground">{attendanceStats.present}</p>
              </div>
              <div className="bg-brand-danger/10 p-4 rounded-xl border border-brand-danger/20">
                <p className="text-sm text-brand-danger font-medium mb-1">Absent</p>
                <p className="text-3xl font-bold text-foreground">{attendanceStats.absent}</p>
              </div>
              <div className="bg-brand-warning/10 p-4 rounded-xl border border-brand-warning/20">
                <p className="text-sm text-brand-warning font-medium mb-1">Leaves</p>
                <p className="text-3xl font-bold text-foreground">{attendanceStats.leaves}</p>
              </div>
              <div className="bg-muted p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">Total Days</p>
                <p className="text-3xl font-bold text-foreground">{attendanceStats.totalWorkingDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tickets, Assets, Salary */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard 
              label="Assigned Assets" 
              value={myAssets.length} 
              icon={<Package className="h-5 w-5" />}
              iconClassName="bg-blue-500/10 text-blue-500"
              lineClassName="bg-blue-500"
            />
            <SummaryCard 
              label="Active Tickets" 
              value={myTickets.filter(t => t.status !== "Completed").length} 
              icon={<Ticket className="h-5 w-5" />}
              iconClassName="bg-amber-500/10 text-amber-500"
              lineClassName="bg-amber-500"
            />
          </div>

          {/* Salary History */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-bold">Salary History</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-brand-primary">View All</Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Month</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {salaryHistory.map((salary, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground">{salary.month}</td>
                      <td className="px-4 py-4 font-bold">{salary.amount}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={salary.status} />
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{salary.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* My Tickets */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-bold">Recent Tickets</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {myTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-foreground">{ticket.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ticket.id} • Raised on {ticket.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={ticket.priority === "High" ? "destructive" : "default"}>
                      {ticket.priority}
                    </Badge>
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Ticket Modal */}
      {isTicketModalOpen && (
        <RaiseTicketModal isOpen={isTicketModalOpen} setIsOpen={setIsTicketModalOpen} />
      )}
    </div>
  );
}
