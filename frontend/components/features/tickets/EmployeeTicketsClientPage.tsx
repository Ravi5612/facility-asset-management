"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TicketTable } from "@/components/features/tickets/TicketTable";
import { TicketActionModal } from "@/components/features/tickets/TicketActionModal";
import { ticketService } from "@/services/ticket.service";
import { InterDeptTicket } from "@/types";
import { PageSkeleton } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";
import { ClipboardList, Navigation, Ticket, Clock, Activity, CheckCircle2 } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";

export function EmployeeTicketsClientPage() {
  const [activeTab, setActiveTab] = useState<"assigned" | "raised">("assigned");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");

  const [selectedTicket, setSelectedTicket] = useState<InterDeptTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Tickets based on active tab
  const { data: rawData, isLoading } = useQuery({
    queryKey: ["employee-tickets", activeTab],
    queryFn: () => activeTab === "assigned" ? ticketService.getAssignedToMeTickets() : ticketService.getOutboundTickets()
  });

  const rawTickets = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if (rawData && typeof rawData === 'object' && Array.isArray((rawData as any).data)) return (rawData as any).data;
    return [];
  }, [rawData]);

  const formattedTickets: InterDeptTicket[] = useMemo(() => {
    return rawTickets.map((t: any) => ({
      id: t.ticketCode || t.id,
      dbId: t.id,
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
      assignedAt: t.assignedAt,
      resolvedAt: t.resolvedAt,
      resolutionMessage: t.resolutionNotes,
      rating: t.rating,
      ratingFeedback: t.ratingFeedback,
      createdAt: t.createdAt
    }));
  }, [rawTickets]);

  const filteredTickets = useMemo(() => {
    return formattedTickets.filter((ticket) => {
      if (search && !ticket.subject.toLowerCase().includes(search.toLowerCase()) && !ticket.id.toLowerCase().includes(search.toLowerCase())) return false;
      
      const mappedStatus = ticket.status === "OPEN" ? "Pending" 
                         : ticket.status === "IN_PROGRESS" ? "In Progress"
                         : ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "Completed"
                         : ticket.status;
      if (statusFilter !== "All" && mappedStatus !== statusFilter) return false;
      if (priorityFilter !== "All" && ticket.priority !== priorityFilter) return false;
      
      if (dateFilter !== "All") {
        const today = new Date().toISOString().split('T')[0];
        if (dateFilter === "Today" && ticket.dateRaised !== today) return false;
        if (dateFilter === "Custom" && customDate && ticket.dateRaised !== customDate) return false;
      }
      return true;
    });
  }, [formattedTickets, search, statusFilter, priorityFilter, dateFilter, customDate]);

  // Calculate stats based on current tab's formatted tickets
  const totalTickets = formattedTickets.length;
  const pendingTickets = formattedTickets.filter(t => t.status === "OPEN" || t.status === "Pending").length;
  const inProgressTickets = formattedTickets.filter(t => t.status === "IN_PROGRESS" || t.status === "In Progress").length;
  const completedTickets = formattedTickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED" || t.status === "Completed").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Tickets"
          value={totalTickets}
          icon={<Ticket className="w-5 h-5" />}
          className="border-blue-100 bg-blue-50/30"
        />
        <SummaryCard
          label="Pending"
          value={pendingTickets}
          icon={<Clock className="w-5 h-5 text-orange-500" />}
          className="border-orange-100 bg-orange-50/30"
        />
        <SummaryCard
          label="In Progress"
          value={inProgressTickets}
          icon={<Activity className="w-5 h-5 text-blue-500" />}
          className="border-blue-100 bg-blue-50/30"
        />
        <SummaryCard
          label="Completed"
          value={completedTickets}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          className="border-green-100 bg-green-50/30"
        />
      </div>

      {/* Tabs Section */}
      <div className="flex bg-card border rounded-lg p-1.5 w-full md:w-fit shadow-sm relative">
        <Button
          variant={activeTab === "assigned" ? "default" : "ghost"}
          onClick={() => setActiveTab("assigned")}
          className={`flex-1 md:w-48 gap-2 rounded-md transition-all duration-300 font-bold tracking-wide ${
            activeTab === "assigned" 
              ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 shadow-md" 
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Assigned to Me
        </Button>
        <Button
          variant={activeTab === "raised" ? "default" : "ghost"}
          onClick={() => setActiveTab("raised")}
          className={`flex-1 md:w-48 gap-2 rounded-md transition-all duration-300 font-bold tracking-wide ${
            activeTab === "raised" 
              ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 shadow-md" 
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Navigation className="w-4 h-4" />
          Raised by Me
        </Button>
      </div>

      {isLoading ? (
        <div className="pt-4"><PageSkeleton /></div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm p-4">
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
        </div>
      )}

      {selectedTicket && (
        <TicketActionModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          canAssign={false}
          onSuccess={() => {
            // Let react-query re-fetch on window focus, or handle it here if needed
          }}
        />
      )}
    </div>
  );
}
