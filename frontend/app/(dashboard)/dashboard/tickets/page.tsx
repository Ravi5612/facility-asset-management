"use client";

import { useState, useMemo } from "react";
import { SummaryCard } from "@/components/ui/summary-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Ticket, Search, Filter, ChevronRight, Clock, CheckCircle2,
  AlertCircle, AlertTriangle, Loader2
} from "lucide-react";

/* ─── TYPES ─── */
type TicketStatus = "Pending" | "In Progress" | "Completed";
type Priority = "High" | "Medium" | "Low";

type InterDeptTicket = {
  id: string;
  subject: string;
  raisedByDept: string;
  assignedToDept: string;
  handler: string | null; // Null if no one assigned yet
  status: TicketStatus;
  priority: Priority;
  dateRaised: string;
};

/* ─── MOCK DATA ─── */
const mockTickets: InterDeptTicket[] = [
  { id: "TKT-1001", subject: "Laptop screen flickering", raisedByDept: "Marketing", assignedToDept: "Information Technology", handler: "Ravi Rai", status: "In Progress", priority: "High", dateRaised: "2024-03-10" },
  { id: "TKT-1002", subject: "New employee onboarding access", raisedByDept: "Human Resources", assignedToDept: "Information Technology", handler: null, status: "Pending", priority: "Medium", dateRaised: "2024-03-12" },
  { id: "TKT-1003", subject: "Budget approval for Q2 campaign", raisedByDept: "Marketing", assignedToDept: "Finance", handler: "Amit Kumar", status: "Completed", priority: "High", dateRaised: "2024-02-28" },
  { id: "TKT-1004", subject: "Air conditioning not working", raisedByDept: "Information Technology", assignedToDept: "Operations", handler: "Rahul Verma", status: "In Progress", priority: "Medium", dateRaised: "2024-03-11" },
  { id: "TKT-1005", subject: "Payroll query for Jan 2024", raisedByDept: "Customer Support", assignedToDept: "Finance", handler: null, status: "Pending", priority: "Low", dateRaised: "2024-03-14" },
  { id: "TKT-1006", subject: "Need dual monitors setup", raisedByDept: "Research & Development", assignedToDept: "Information Technology", handler: "Sita Sharma", status: "Completed", priority: "Low", dateRaised: "2024-01-20" },
  { id: "TKT-1007", subject: "Customer data export request", raisedByDept: "Operations", assignedToDept: "Customer Support", handler: "Neha Gupta", status: "Pending", priority: "High", dateRaised: "2024-03-15" },
];

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const filteredTickets = useMemo(() => {
    return mockTickets.filter(t => {
      const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase()) ||
                          t.raisedByDept.toLowerCase().includes(search.toLowerCase()) ||
                          t.assignedToDept.toLowerCase().includes(search.toLowerCase()) ||
                          (t.handler?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [search, statusFilter, priorityFilter]);

  // Stats
  const total = mockTickets.length;
  const pending = mockTickets.filter(t => t.status === "Pending").length;
  const inProgress = mockTickets.filter(t => t.status === "In Progress").length;
  const completed = mockTickets.filter(t => t.status === "Completed").length;

  // Helpers
  const getStatusIcon = (status: TicketStatus) => {
    if (status === "Pending") return <Clock className="h-3 w-3 mr-1" />;
    if (status === "In Progress") return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
    return <CheckCircle2 className="h-3 w-3 mr-1" />;
  };

  const getStatusColor = (status: TicketStatus) => {
    if (status === "Pending") return "bg-orange-100 text-orange-700";
    if (status === "In Progress") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  const getPriorityColor = (priority: Priority) => {
    if (priority === "High") return "text-red-600 bg-red-50";
    if (priority === "Medium") return "text-yellow-600 bg-yellow-50";
    return "text-slate-600 bg-slate-100";
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cross-Department Tickets</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor issues and requests raised between different departments.</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          label="Total Tickets"
          value={total}
          icon={<Ticket className="h-6 w-6" />}
          iconClassName="bg-slate-100 text-slate-600"
          lineClassName="bg-slate-500"
        />
        <SummaryCard
          label="Pending"
          value={pending}
          icon={<AlertCircle className="h-6 w-6" />}
          iconClassName="bg-orange-100 text-orange-600"
          lineClassName="bg-orange-500"
        />
        <SummaryCard
          label="In Progress"
          value={inProgress}
          icon={<Loader2 className="h-6 w-6" />}
          iconClassName="bg-blue-100 text-blue-600"
          lineClassName="bg-blue-500"
        />
        <SummaryCard
          label="Completed"
          value={completed}
          icon={<CheckCircle2 className="h-6 w-6" />}
          iconClassName="bg-green-100 text-green-600"
          lineClassName="bg-green-500"
        />
      </div>

      {/* ── Tickets Table Section ── */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ticket, department, handler..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background" />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none">
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none">
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <Button variant="outline" className="gap-2 bg-background"><Filter className="h-4 w-4" /> Filters</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[250px]">Ticket Info</th>
                <th className="px-4 py-3">Raised By → Assigned To</th>
                <th className="px-4 py-3">Handler</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted/20 transition-colors">
                    {/* Ticket Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-muted-foreground">{ticket.id}</span>
                        {ticket.priority === "High" && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        <span className={`text-[10px] px-1.5 rounded-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="font-bold text-foreground leading-tight">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">Raised: {ticket.dateRaised}</p>
                    </td>

                    {/* Departments */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">From: <strong className="text-foreground">{ticket.raisedByDept}</strong></span>
                        <span className="text-xs text-muted-foreground">To: <strong className="text-[var(--brand-primary)]">{ticket.assignedToDept}</strong></span>
                      </div>
                    </td>

                    {/* Handler */}
                    <td className="px-4 py-3">
                      {ticket.handler ? (
                        <span className="font-semibold">{ticket.handler}</span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={`text-xs px-2 py-0.5 flex items-center w-max ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-[var(--brand-primary)] hover:bg-blue-50">
                        View Details <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
