"use client";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Filter, ChevronRight, Clock, CheckCircle2,
  AlertTriangle, Mail, Phone, X
} from "lucide-react";
import { InterDeptTicket, TicketStatus, Priority } from "@/types";
import { TicketDetailsModal } from "./TicketDetailsModal";
import { Spinner } from "@/components/ui/spinner";


// ── Helpers ──
function getStatusIcon(status: TicketStatus) {
  if (status === "Pending") return <Clock className="h-3 w-3 mr-1" />;
  if (status === "In Progress") return <Spinner size="xs" className="mr-1" />;
  return <CheckCircle2 className="h-3 w-3 mr-1" />;
}

function getPriorityColor(priority: Priority) {
  if (priority === "High") return "text-red-600 bg-red-50";
  if (priority === "Medium") return "text-yellow-600 bg-yellow-50";
  return "text-slate-600 bg-slate-100";
}

// ── Props ──
interface TicketTableProps {
  tickets: InterDeptTicket[];
  search: string;
  statusFilter: string;
  priorityFilter: string;
  dateFilter: string;
  customDate: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onDateFilterChange: (v: string) => void;
  onCustomDateChange: (v: string) => void;
  onClearFilters: () => void;
}

export function TicketTable({
  tickets, search, statusFilter, priorityFilter, dateFilter, customDate,
  onSearchChange, onStatusChange, onPriorityChange, onDateFilterChange, onCustomDateChange, onClearFilters
}: TicketTableProps) {
  
  const hasFilters = search !== "" || statusFilter !== "All" || priorityFilter !== "All" || dateFilter !== "All";

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search ticket, department, handler..."
          className="flex-1 max-w-[300px]"
        />
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter */}
          <select value={dateFilter} onChange={(e) => onDateFilterChange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none cursor-pointer">
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Custom">Custom Date</option>
          </select>
          
          {dateFilter === "Custom" && (
            <input 
              type="date"
              value={customDate}
              onChange={(e) => onCustomDateChange(e.target.value)}
              className="px-3 py-1.5 border border-input rounded-md bg-background text-sm focus:outline-none cursor-pointer"
            />
          )}

          <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none cursor-pointer">
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => onPriorityChange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none cursor-pointer">
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>                  
          </select>

          {hasFilters && (
            <Button 
              variant="ghost" 
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground hover:bg-muted h-9 px-3 gap-1.5"
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="p-4 bg-muted/5">
        {tickets.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground bg-card border rounded-xl border-dashed">
            No tickets found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-card border rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                
                {/* Card Header: ID & Priority */}
                <div className="p-3.5 border-b bg-muted/10 flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-muted-foreground">{ticket.id}</span>
                  <div className="flex items-center gap-1.5">
                    {ticket.priority === "High" && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-foreground text-base leading-snug mb-1.5">{ticket.subject}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Clock className="h-3 w-3" /> Raised: {ticket.dateRaised}
                    </p>
                    {ticket.description && (
                      <p className="text-sm text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/30 line-clamp-2" title={ticket.description}>
                        {ticket.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Department Routing & HOD Info */}
                  <div className="flex flex-col gap-2 p-3 bg-muted/30 border border-border/50 rounded-lg text-sm mt-auto">
                    {/* HOD Info */}
                    {ticket.raisedByHodName && (
                      <div className="flex flex-col gap-1.5 pb-2 mb-1 border-b border-border/50">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Raised By (HOD)</span>
                          <strong className="text-foreground text-xs">{ticket.raisedByHodName}</strong>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {ticket.raisedByHodEmail}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {ticket.raisedByHodPhone}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">From Dept</span>
                      <strong className="text-foreground text-xs">{ticket.raisedByDept}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">To Dept</span>
                      <strong className="text-brand-primary text-xs">{ticket.assignedToDept}</strong>
                    </div>
                  </div>

                  {/* Status & Handler */}
                  <div className="flex justify-between items-end mt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Handler</span>
                      {ticket.handler ? (
                        <span className="font-semibold text-sm">{ticket.handler}</span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Unassigned</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Status</span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="p-3 bg-muted/10 border-t flex justify-end">
                  <TicketDetailsModal ticket={ticket} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
