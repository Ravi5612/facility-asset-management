"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Filter, ChevronRight, Clock, CheckCircle2,
  AlertTriangle, Mail, Phone, X, ChevronDown, ChevronUp, Star
} from "lucide-react";
import { InterDeptTicket, TicketStatus, Priority } from "@/types";
import { TicketDetailsModal } from "./TicketDetailsModal";
import { Spinner } from "@/components/ui/spinner";


function getPriorityColor(priority: string) {
  const p = priority?.toUpperCase() || "";
  if (p === "HIGH" || p === "URGENT" || p === "CRITICAL") return "text-brand-danger bg-brand-danger/10 border-brand-danger/20 border";
  if (p === "MEDIUM") return "text-brand-warning bg-brand-warning/10 border-brand-warning/20 border";
  if (p === "LOW") return "text-brand-success bg-brand-success/10 border-brand-success/20 border";
  return "text-muted-foreground bg-muted/50 border-border border";
}

function getCardPriorityStyle(priority: string) {
  const p = priority?.toUpperCase() || "";
  if (p === "HIGH" || p === "URGENT" || p === "CRITICAL") return "border-l-4 border-l-brand-danger border-brand-danger/20";
  if (p === "MEDIUM") return "border-l-4 border-l-brand-warning border-brand-warning/20";
  if (p === "LOW") return "border-l-4 border-l-brand-success border-brand-success/20";
  return "border-l-4 border-l-border";
}

function getHeaderPriorityStyle(priority: string) {
  const p = priority?.toUpperCase() || "";
  if (p === "HIGH" || p === "URGENT" || p === "CRITICAL") return "bg-brand-danger/5 border-b-brand-danger/10";
  if (p === "MEDIUM") return "bg-brand-warning/5 border-b-brand-warning/10";
  if (p === "LOW") return "bg-brand-success/5 border-b-brand-success/10";
  return "bg-muted/10 border-b-border/50";
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
  onTicketClick?: (ticket: InterDeptTicket) => void;
}

export function TicketTable({
  tickets, search, statusFilter, priorityFilter, dateFilter, customDate,
  onSearchChange, onStatusChange, onPriorityChange, onDateFilterChange, onCustomDateChange, onClearFilters,
  onTicketClick
}: TicketTableProps) {
  
  const hasFilters = search !== "" || statusFilter !== "All" || priorityFilter !== "All" || dateFilter !== "All";
  
  // Track which cards are expanded (default is collapsed so they are not in this record initially)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCollapse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {tickets.map((ticket) => {
              const isCollapsed = !expandedCards[ticket.id];
              return (
              <div 
                key={ticket.id} 
                onClick={() => onTicketClick && onTicketClick(ticket)}
                className={`relative bg-card rounded-xl overflow-hidden flex flex-col shadow-sm transition-shadow border-4 ${onTicketClick ? 'cursor-pointer hover:shadow-md' : ''} ${
                  ticket.priority?.toUpperCase() === 'HIGH' || ticket.priority?.toUpperCase() === 'CRITICAL' ? 'border-brand-danger' : 
                  ticket.priority?.toUpperCase() === 'MEDIUM' ? 'border-brand-warning' : 
                  ticket.priority?.toUpperCase() === 'LOW' ? 'border-brand-success' : 'border-slate-400'
                }`}
              >
                
                {/* Card Header: Dark Navy */}
                <div className={`bg-[#0a0f2c] pt-4 px-4 flex justify-between items-start text-white ${isCollapsed ? 'pb-4' : 'pb-6'}`}>
                  <div className="flex items-center gap-3">
                      <div className={`p-2 border rounded-lg ${
                        ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' 
                          ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                          : ticket.status === 'IN_PROGRESS'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                      }`}>
                        <div className="flex flex-col items-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border
                            ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-green-100 text-green-700 border-green-200' 
                              : ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border-blue-200' 
                              : 'bg-orange-100 text-orange-700 border-orange-200'}`}
                          >
                            {ticket.status === 'OPEN' ? 'PENDING' : ticket.status?.replace('_', ' ')}
                            {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                          </span>
                          {ticket.rating && (
                            <div className="flex gap-[1px] mt-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`h-2.5 w-2.5 ${star <= ticket.rating! ? "fill-yellow-400 text-yellow-400" : "text-green-900/20"}`} />
                              ))}
                            </div>
                          )}
                          {(ticket as any).hodApprovalStatus === 'PENDING' && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                              ⏳ Approval Req
                            </div>
                          )}
                        </div>
                      </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-white/60 uppercase">Ticket ID</div>
                      <div className="text-lg font-bold tracking-tight">{ticket.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${ticket.priority?.toUpperCase() === 'HIGH' || ticket.priority?.toUpperCase() === 'CRITICAL' ? 'bg-red-500 text-white' : ticket.priority?.toUpperCase() === 'MEDIUM' ? 'bg-yellow-500 text-white' : ticket.priority?.toUpperCase() === 'LOW' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {ticket.priority?.toUpperCase() === 'HIGH' || ticket.priority?.toUpperCase() === 'CRITICAL' ? <AlertTriangle className="h-3 w-3" /> : null}
                      {ticket.priority}
                    </span>
                    <button 
                      onClick={(e) => toggleCollapse(e, ticket.id)}
                      className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                      title={isCollapsed ? "Expand Ticket" : "Collapse Ticket"}
                    >
                      {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {!isCollapsed && (
                  <>
                    {/* Card Body */}
                <div className="bg-card flex-1 flex flex-col p-4">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-slate-800 leading-tight mb-1.5">{ticket.subject}</h3>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Raised: {ticket.dateRaised} {ticket.timeRaised && `at ${ticket.timeRaised}`}
                      </p>
                      {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (ticket as any).resolvedAt && (
                        <p className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Resolved: {new Date((ticket as any).resolvedAt).toISOString().split('T')[0]} at {new Date((ticket as any).resolvedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </p>
                      )}
                    </div>
                  </div>

                  {ticket.description && (
                    <div className="bg-[#f8f9fe] border border-slate-200/60 rounded-xl p-3 flex items-start gap-3 mb-4">
                      <div className="mt-0.5 text-indigo-500">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <p className="text-sm font-medium text-slate-700 line-clamp-2" title={ticket.description}>
                        {ticket.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Department Routing & HOD Info Box */}
                  <div className="border border-slate-200/80 shadow-sm rounded-xl p-3.5 mb-3 flex flex-col">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${
                          ticket.priority?.toUpperCase() === 'HIGH' || ticket.priority?.toUpperCase() === 'CRITICAL' ? 'bg-brand-danger/10 text-brand-danger border-brand-danger/20' : 
                          ticket.priority?.toUpperCase() === 'MEDIUM' ? 'bg-brand-warning/10 text-brand-warning border-brand-warning/20' : 
                          ticket.priority?.toUpperCase() === 'LOW' ? 'bg-brand-success/10 text-brand-success border-brand-success/20' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Raised By (HOD)</span>
                          <span className="font-bold text-slate-800 text-sm leading-tight">{ticket.raisedByHodName || 'System'}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {ticket.raisedByHodEmail || 'N/A'}</span>
                        </div>
                      </div>
                      <div className={`h-9 w-9 rounded-full border flex items-center justify-center bg-white shadow-sm ${
                        ticket.priority?.toUpperCase() === 'HIGH' || ticket.priority?.toUpperCase() === 'CRITICAL' ? 'text-brand-danger border-brand-danger/30' : 
                        ticket.priority?.toUpperCase() === 'MEDIUM' ? 'text-brand-warning border-brand-warning/30' : 
                        ticket.priority?.toUpperCase() === 'LOW' ? 'text-brand-success border-brand-success/30' : 'text-slate-500 border-slate-200'
                      }`}>
                        <Phone className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">From Dept</span>
                      <strong className="text-slate-800 text-xs">{ticket.raisedByDept}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">To Dept</span>
                      <strong className={`text-xs ${
                        ticket.priority?.toUpperCase() === 'HIGH' || ticket.priority?.toUpperCase() === 'CRITICAL' ? 'text-brand-danger' : 
                        ticket.priority?.toUpperCase() === 'MEDIUM' ? 'text-brand-warning' : 
                        ticket.priority?.toUpperCase() === 'LOW' ? 'text-brand-success' : 'text-slate-500'
                      }`}>{ticket.assignedToDept}</strong>
                    </div>
                  </div>

                  {/* Status & Handler Box */}
                  <div className="border border-slate-200/80 shadow-sm rounded-xl p-3 flex justify-between mt-auto">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Handler</span>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <span className="font-bold text-sm text-slate-800">{ticket.handler || 'Unassigned'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Status</span>
                      <div className={`border rounded px-2 py-1 flex items-center gap-1.5
                        ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-green-50/50 border-green-100 text-green-600' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-blue-50/50 border-blue-100 text-blue-600' :
                          'bg-orange-50/50 border-orange-100 text-orange-600'}`}
                      >
                        {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : ticket.status === 'IN_PROGRESS' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 animate-[spin_3s_linear_infinite]"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        )}
                        <span className="text-[10px] font-bold tracking-wider uppercase">{ticket.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Footer Button */}
                <div 
                  className={`w-full py-3 flex justify-center items-center gap-1 text-white text-sm font-bold tracking-wide transition-opacity hover:opacity-90 ${
                    ticket.priority?.toUpperCase() === 'HIGH' || ticket.priority?.toUpperCase() === 'CRITICAL' ? 'bg-brand-danger' : 
                    ticket.priority?.toUpperCase() === 'MEDIUM' ? 'bg-brand-warning' : 
                    ticket.priority?.toUpperCase() === 'LOW' ? 'bg-brand-success' : 'bg-slate-500'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const triggerBtn = e.currentTarget.querySelector('.hidden button');
                    if (triggerBtn) (triggerBtn as HTMLElement).click();
                  }}
                >
                  View Details <ChevronRight className="h-4 w-4" />
                  <div className="hidden" onClick={(e) => e.stopPropagation()}>
                     <TicketDetailsModal ticket={ticket} />
                  </div>
                </div>
                  </>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
