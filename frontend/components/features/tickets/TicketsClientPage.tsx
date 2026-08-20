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
import { ticketService } from "@/services/ticket.service";

export function TicketsClientPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");

  const { data: rawTickets = [], isLoading } = useQuery({
    queryKey: ["department-tickets"],
    queryFn: ticketService.getTickets
  });

  const formattedTickets: InterDeptTicket[] = useMemo(() => {
    return rawTickets.map((t: any) => ({
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
  const total = formattedTickets.length;
  const pending = formattedTickets.filter(t => t.status === "Pending").length;
  const inProgress = formattedTickets.filter(t => t.status === "In Progress").length;
  const completed = formattedTickets.filter(t => t.status === "Completed").length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inter-Department Tickets</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor issues and requests raised between different departments.</p>
      </div>

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
