"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HelpCircle, Ticket, Clock, Activity, CheckCircle2, PlusCircle } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { Button } from "@/components/ui/button";
import { RaiseTicketModal } from "@/components/features/tickets/RaiseTicketModal";
import { TicketTable } from "@/components/features/tickets/TicketTable";
import { InterDeptTicket } from "@/types";
import { ticketService } from "@/services/ticket.service";

export default function HelpPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Filters state for TicketTable
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");

  const { data: rawTickets = [], isLoading } = useQuery({
    queryKey: ["outbound-tickets"],
    queryFn: ticketService.getOutboundTickets
  });

  // Map backend response to InterDeptTicket format for the table
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
      assignedAt: (t as any).assignedAt,
      resolvedAt: (t as any).resolvedAt,
      resolutionMessage: (t as any).resolutionNotes,
      rating: (t as any).rating,
      ratingFeedback: (t as any).ratingFeedback,
    }));
  }, [rawTickets]);

  const filteredTickets = useMemo(() => {
    return formattedTickets.filter((t: InterDeptTicket) => {
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
  }, [formattedTickets, search, statusFilter, priorityFilter, dateFilter, customDate]);

  // Stats
  const totalTickets    = formattedTickets.length;
  const pendingTickets  = formattedTickets.filter(t => t.status === "OPEN" || t.status === "Pending").length;
  const inProgressTickets = formattedTickets.filter(t => t.status === "IN_PROGRESS" || t.status === "In Progress").length;
  const completedTickets  = formattedTickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED" || t.status === "Completed").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <RaiseTicketModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["outbound-tickets"] })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-brand-primary" />
            Help &amp; Support
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your support tickets and get assistance from administration.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary hover:opacity-90 text-white gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Raise New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Tickets"  value={totalTickets}      icon={<Ticket       className="h-6 w-6" />} iconClassName="bg-brand-info/10 text-brand-info"       lineClassName="bg-brand-info" />
        <SummaryCard label="Pending"        value={pendingTickets}    icon={<Clock        className="h-6 w-6" />} iconClassName="bg-brand-warning/10 text-brand-warning"  lineClassName="bg-brand-warning" />
        <SummaryCard label="In Progress"    value={inProgressTickets} icon={<Activity     className="h-6 w-6" />} iconClassName="bg-brand-primary/10 text-brand-primary"  lineClassName="bg-brand-primary" />
        <SummaryCard label="Resolved"       value={completedTickets}  icon={<CheckCircle2 className="h-6 w-6" />} iconClassName="bg-brand-success/10 text-brand-success"  lineClassName="bg-brand-success" />
      </div>

      {/* My Raised Tickets Table */}
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
        onClearFilters={() => {
          setSearch("");
          setStatusFilter("All");
          setPriorityFilter("All");
          setDateFilter("All");
          setCustomDate("");
        }}
      />
    </div>
  );
}
