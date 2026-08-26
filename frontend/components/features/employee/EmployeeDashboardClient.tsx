"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
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
import { TicketActionModal } from "@/components/features/tickets/TicketActionModal";
import { authService } from "@/services/auth.service";
import { assetService } from "@/services/asset.service";
import { ticketService } from "@/services/ticket.service";
import { InterDeptTicket } from "@/types";

export function EmployeeDashboardClient() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<InterDeptTicket | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Fetch real data
  const { data: user = null } = useQuery({
    queryKey: ["auth-me"],
    queryFn: authService.getMe,
  });

  const { data: myAssets = [] } = useQuery({
    queryKey: ["my-assets"],
    queryFn: assetService.getAssignedToMeAssets,
  });

  const { data: myRaisedTickets = [] } = useQuery({
    queryKey: ["outbound-tickets"],
    queryFn: ticketService.getOutboundTickets,
  });

  const { data: assignedTicketsRaw = [] } = useQuery({
    queryKey: ["assigned-to-me-tickets"],
    queryFn: ticketService.getAssignedToMeTickets,
  });

  const employeeInfo = user ? {
    name: (user as any).employee
      ? `${(user as any).employee.firstName} ${(user as any).employee.lastName}`
      : (user as any).fullName || "Employee",
    employeeCode: (user as any).employee?.employeeCode || (user as any).employeeCode || "N/A",
    designation: (user as any).employee?.designation || (user as any).designation || "N/A",
    department: (user as any).employee
      ? (user as any).departmentName
      : (user as any).departmentName || "N/A",
    email: (user as any).employee?.email || (user as any).email || "N/A",
    phone: (user as any).employee?.phone || "N/A",
    joiningDate: (user as any).employee?.joiningDate
      ? new Date((user as any).employee.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "N/A",
    profilePic: (user as any).employee?.profilePhoto || null,
  } : {
    name: (user as any)?.fullName || "Employee",
    employeeCode: (user as any)?.employeeCode || "N/A",
    designation: (user as any)?.designation || "N/A",
    department: (user as any)?.departmentName || "N/A",
    email: (user as any)?.email || "N/A",
    phone: "N/A",
    joiningDate: "N/A",
    profilePic: null,
  };

  const attendanceStats = {
    present: 0,
    absent: 0,
    leaves: 0,
    totalWorkingDays: 0
  };

  const salaryHistory = [
    { month: "October 2025", amount: "₹ 85,000", status: "Processing", date: "-" },
    { month: "September 2025", amount: "₹ 85,000", status: "Credited", date: "30 Sep 2025" },
    { month: "August 2025", amount: "₹ 85,000", status: "Credited", date: "31 Aug 2025" },
  ];

  // Map assigned tickets for TicketActionModal
  const mappedAssignedTickets: InterDeptTicket[] = assignedTicketsRaw.map((t: any) => ({
    id: t.ticketCode || t.id,
    subject: t.subject,
    description: t.description,
    raisedByDept: t.raisedByDept?.name || "Unknown",
    raisedByHodName: t.raisedByEmployee ? `${t.raisedByEmployee.firstName} ${t.raisedByEmployee.lastName}` : "System",
    assignedToDept: t.assignedToDept?.name || "Unknown",
    handler: t.assignedToEmployee ? `${t.assignedToEmployee.firstName} ${t.assignedToEmployee.lastName}` : null,
    status: t.status,
    priority: t.priority,
    dateRaised: new Date(t.createdAt).toISOString().split('T')[0],
  }));

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <RaiseTicketModal isOpen={isTicketModalOpen} setIsOpen={setIsTicketModalOpen} />
      
      <TicketActionModal 
        ticket={selectedTicket} 
        isOpen={isActionModalOpen} 
        setIsOpen={setIsActionModalOpen} 
      />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {employeeInfo.name.split(" ")[0]}! 👋
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
              <Badge variant="secondary" className="mt-2 font-mono">{employeeInfo.employeeCode}</Badge>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{employeeInfo.designation}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{employeeInfo.department} Department</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{employeeInfo.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{employeeInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Joined {employeeInfo.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-primary" /> This Month
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-success/10 border border-brand-success/20 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Present</p>
                <p className="text-2xl font-bold text-brand-success">{attendanceStats.present}</p>
              </div>
              <div className="bg-brand-danger/10 border border-brand-danger/20 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Absent</p>
                <p className="text-2xl font-bold text-brand-danger">{attendanceStats.absent}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Leaves Taken</span>
              <span className="font-medium">{attendanceStats.leaves}</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Assets & Tickets */}
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
              label="Active Requests" 
              value={myRaisedTickets.filter((t: any) => t.status === "OPEN" || t.status === "IN_PROGRESS").length} 
              icon={<Ticket className="h-5 w-5" />}
              iconClassName="bg-brand-warning/10 text-brand-warning"
              lineClassName="bg-brand-warning"
            />
          </div>

          {/* Assigned Tasks (For Resolvers like IT Support) */}
          {mappedAssignedTickets.length > 0 && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-brand-danger" /> Assigned To Me
                </h3>
                <Badge variant="secondary">{mappedAssignedTickets.length} Task(s)</Badge>
              </div>
              <div className="space-y-4">
                {mappedAssignedTickets.map((ticket: InterDeptTicket) => (
                  <div key={ticket.id} 
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsActionModalOpen(true);
                    }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-muted/30 cursor-pointer transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">Raised by: {ticket.raisedByHodName} ({ticket.raisedByDept})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Assets */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-primary" /> My Assets
              </h3>
              <Button variant="ghost" size="sm" className="text-brand-primary">View All</Button>
            </div>
            
            {myAssets.length === 0 ? (
              <div className="py-8 text-center border rounded-xl border-dashed">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                <p className="text-sm text-muted-foreground">No assets assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myAssets.map((asset: any) => (
                  <div key={asset.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{asset.name}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{asset.category?.name || 'Asset'} • Assigned: {new Date(asset.assignedDate || asset.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted-foreground">{asset.assetCode || asset.serialNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Raised Tickets */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Ticket className="h-5 w-5 text-brand-primary" /> My Raised Tickets
              </h3>
            </div>
            
            {myRaisedTickets.length === 0 ? (
              <div className="py-8 text-center border rounded-xl border-dashed">
                <Ticket className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                <p className="text-sm text-muted-foreground">No tickets raised</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRaisedTickets.slice(0, 3).map((ticket: any) => (
                  <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <h4 className="font-semibold text-foreground text-sm">{ticket.subject}</h4>
                      <p className="text-xs text-muted-foreground">To: {ticket.assignedToDept?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                ))}
                {myRaisedTickets.length > 3 && (
                  <Button variant="ghost" className="w-full text-brand-primary text-sm">
                    View All {myRaisedTickets.length} Tickets
                  </Button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
