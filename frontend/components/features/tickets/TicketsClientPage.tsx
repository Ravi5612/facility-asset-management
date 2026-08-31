"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SummaryCard } from "@/components/ui/summary-card";
import {
  Ticket, Clock, CheckCircle2,
  AlertCircle, Loader2
} from "lucide-react";

import { TicketStatus } from "@/types";
import { InterDeptTicket } from "@/types";
import { TicketTable } from "@/components/features/tickets/TicketTable";
import { TicketActionModal } from "@/components/features/tickets/TicketActionModal";
import { ticketService } from "@/services/ticket.service";
import { departmentService } from "@/services/department.service";
import { PageSkeleton } from "@/components/ui/skeletons";
import { Building2, ArrowLeft, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TicketsClientPage({ fetchMode = "inbound" }: { fetchMode?: "all" | "inbound" | "outbound" | "assigned" }) {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");

  const [selectedTicket, setSelectedTicket] = useState<InterDeptTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFetchFn = () => {
    if (fetchMode === "all") return ticketService.getTickets;
    if (fetchMode === "outbound") return ticketService.getOutboundTickets;
    if (fetchMode === "assigned") return ticketService.getAssignedToMeTickets;
    return ticketService.getInboundTickets;
  };

  const { data: departments, isLoading: isDeptsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
    enabled: fetchMode === "all" && !selectedDept
  });

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["tickets", fetchMode],
    queryFn: getFetchFn()
  });

  // Handle paginated { data, ... } or plain array
  const rawTickets = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if (rawData && typeof rawData === 'object' && Array.isArray((rawData as any).data)) return (rawData as any).data;
    return [];
  }, [rawData]);

  const formattedTickets: InterDeptTicket[] = useMemo(() => {
    return rawTickets.map((t: { 
      ticketCode?: string; id: string; subject: string; status: string; priority: string; 
      raisedByDept?: { name: string }; assignedToDept?: { name: string }; createdAt: string; 
      raisedByEmployee?: { firstName: string; lastName: string; email: string };
      assignedToEmployee?: { firstName: string; lastName: string; email: string };
      description?: string 
    }) => ({
      id: t.ticketCode || t.id,
      subject: t.subject,
      description: t.description,
      raisedByDept: t.raisedByDept?.name || "Unknown",
      raisedByHodName: t.raisedByEmployee ? `${t.raisedByEmployee.firstName} ${t.raisedByEmployee.lastName}` : "System",
      raisedByHodEmail: t.raisedByEmployee?.email,
      assignedToDept: t.assignedToDept?.name || "Unknown",
      handler: t.assignedToEmployee ? `${t.assignedToEmployee.firstName} ${t.assignedToEmployee.lastName}` : null,
      status: t.status,
      priority: t.priority === "CRITICAL" ? "URGENT" : t.priority,
      dateRaised: new Date(t.createdAt).toISOString().split('T')[0],
      timeRaised: new Date(t.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      assignedAt: (t as any).assignedAt,
      resolvedAt: (t as any).resolvedAt,
      createdAt: t.createdAt
    }));
  }, [rawTickets]);

  // Filter tickets for the selected department (so stats reflect only this dept)
  const deptTickets = useMemo(() => {
    if (!selectedDept) return formattedTickets;
    return formattedTickets.filter((t: InterDeptTicket) => 
      t.assignedToDept === selectedDept.name || t.raisedByDept === selectedDept.name
    );
  }, [formattedTickets, selectedDept]);

  const filteredTickets = useMemo(() => {
    return deptTickets.filter((t: InterDeptTicket) => {
      const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase()) ||
                          t.raisedByDept.toLowerCase().includes(search.toLowerCase()) ||
                          t.assignedToDept.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
      
      let matchDate = true;
      if (dateFilter !== "All") {
        const ticketDate = new Date(t.dateRaised);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === "Today") {
          const todayStr = today.toISOString().split("T")[0];
          matchDate = t.dateRaised === todayStr;
        } else if (dateFilter === "Yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          matchDate = t.dateRaised === yesterdayStr;
        } else if (dateFilter === "Custom" && customDate) {
          matchDate = t.dateRaised === customDate;
        }
      }

      return matchSearch && matchStatus && matchPriority && matchDate;
    });
  }, [deptTickets, search, statusFilter, priorityFilter, dateFilter, customDate]);



  // Stats
  const total = deptTickets.length;
  const pending = deptTickets.filter(t => t.status === "Pending").length;
  const inProgress = deptTickets.filter(t => t.status === "In Progress").length;
  const completed = deptTickets.filter(t => t.status === "Completed").length;

  if (fetchMode === "all" && !selectedDept) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Department Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">Select a department to view its tickets.</p>
        </div>
        
        {isDeptsLoading ? (
          <div className="pt-4"><PageSkeleton /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {departments?.map((dept: any) => {
                // Fetch stats directly from the backend summary! (Rule #39: No Data Calculation on Frontend)
                const backendStats = (rawData as any)?.departmentStats?.[dept.name] || {
                  total: 0, pending: 0, inProgress: 0, completed: 0, score: 0
                };
                
                const stats = {
                  total: backendStats.total,
                  pending: backendStats.pending,
                  inProgress: backendStats.inProgress,
                  completed: backendStats.completed,
                };
                
                const deptScore = backendStats.score;
                
                return (
              <div 
                key={dept.id} 
                onClick={() => setSelectedDept(dept)}
                className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative group cursor-pointer hover:border-[var(--brand-primary)]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {dept.imageUrl ? (
                      <div className="h-12 w-12 rounded-lg overflow-hidden relative shrink-0 border border-border">
                         <img src={dept.imageUrl} alt={dept.name} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                         <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-[var(--brand-primary)] transition-colors">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-1 uppercase">{dept.code || dept.id.split("-")[0]}</p>
                    </div>
                  </div>
                  {/* Score Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-sm text-xs font-bold transform transition-transform group-hover:scale-105">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                        {deptScore} Pts
                      </div>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mr-1">Perf. Score</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {dept.description || "No description provided."}
                </p>

                <div className="bg-muted/30 rounded-lg p-3 space-y-2 mt-auto">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">HOD</span>
                    <span className="font-semibold text-foreground">{dept.hod || "Unassigned"}</span>
                  </div>
                  
                  {/* Ticket Stats */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50">
                    <div className="flex flex-col items-center p-1 rounded bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total</span>
                      <span className="font-bold text-foreground text-sm">{stats.total}</span>
                    </div>
                    <div className="flex flex-col items-center p-1 rounded bg-amber-50 dark:bg-amber-950/30">
                      <span className="text-[10px] text-amber-600 dark:text-amber-500 uppercase font-semibold">Pend</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">{stats.pending}</span>
                    </div>
                    <div className="flex flex-col items-center p-1 rounded bg-blue-50 dark:bg-blue-950/30">
                      <span className="text-[10px] text-blue-600 dark:text-blue-500 uppercase font-semibold">Prog</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">{stats.inProgress}</span>
                    </div>
                    <div className="flex flex-col items-center p-1 rounded bg-green-50 dark:bg-green-950/30">
                      <span className="text-[10px] text-green-600 dark:text-green-500 uppercase font-semibold">Done</span>
                      <span className="font-bold text-green-700 dark:text-green-400 text-sm">{stats.completed}</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2 group-hover:bg-[var(--brand-primary)] group-hover:text-white group-hover:border-[var(--brand-primary)] transition-colors pointer-events-none">
                  <Eye className="h-4 w-4" /> View Tickets
                </Button>
              </div>
            )})}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* 🔹 Page Header 🔹 */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          {fetchMode === "all" && selectedDept && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDept(null)} className="p-2 h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {selectedDept ? `${selectedDept.name} Tickets` : "Inter-Department Tickets"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-12">Monitor issues and requests raised between different departments.</p>
      </div>

      {isLoading ? (
        <div className="pt-4"><PageSkeleton /></div>
      ) : (
        <>
          {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          label="Total Tickets"
          value={total}
          icon={<Ticket className="h-6 w-6" />}
          iconClassName="bg-muted text-muted-foreground"
          lineClassName="bg-muted-foreground"
        />
        <SummaryCard
          label="Pending"
          value={pending}
          icon={<AlertCircle className="h-6 w-6" />}
          iconClassName="bg-brand-warning/10 text-brand-warning"
          lineClassName="bg-brand-warning"
        />
        <SummaryCard
          label="In Progress"
          value={inProgress}
          icon={<Loader2 className="h-6 w-6" />}
          iconClassName="bg-brand-info/10 text-brand-info"
          lineClassName="bg-brand-info"
        />
        <SummaryCard
          label="Completed"
          value={completed}
          icon={<CheckCircle2 className="h-6 w-6" />}
          iconClassName="bg-brand-success/10 text-brand-success"
          lineClassName="bg-brand-success"
        />
      </div>

      {/* ── Tickets Table Section ── */}
      <TicketTable
        tickets={filteredTickets}
        search={search}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        dateFilter={dateFilter}
        customDate={customDate}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onDateFilterChange={setDateFilter}
        onCustomDateChange={setCustomDate}
        onTicketClick={(ticket) => {
          setSelectedTicket(ticket);
          setIsModalOpen(true);
        }}
        onClearFilters={() => {
          setSearch("");
          setStatusFilter("All");
          setPriorityFilter("All");
          setDateFilter("All");
          setCustomDate("");
        }}
      />

      <TicketActionModal 
        ticket={selectedTicket} 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
      />
        </>
      )}
    </div>
  );
}
