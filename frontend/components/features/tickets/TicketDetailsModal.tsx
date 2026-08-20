"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, AlertTriangle, Clock, Calendar, 
  User, Mail, Phone, Building2, CheckCircle2, MessageSquareText
} from "lucide-react";
import { InterDeptTicket, Priority } from "@/types";

interface TicketDetailsModalProps {
  ticket: InterDeptTicket;
}

function getPriorityColor(priority: Priority) {
  if (priority === "High") return "text-red-600 bg-red-50 border-red-200";
  if (priority === "Medium") return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-slate-600 bg-slate-100 border-slate-200";
}

export function TicketDetailsModal({ ticket }: TicketDetailsModalProps) {
  const [open, setOpen] = useState(false);
  
  // Calculate a mock resolution date based on raised date
  const resDate = new Date(ticket.dateRaised);
  resDate.setDate(resDate.getDate() + 2);
  const mockResolutionDate = resDate.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="w-full h-8 text-xs font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
            View Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        }
      />
      
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        
        {/* Header Area */}
        <div className="bg-muted/30 p-6 border-b">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="font-mono bg-background text-muted-foreground shadow-sm">
                  {ticket.id}
                </Badge>
                <StatusBadge status={ticket.status} />
                <Badge variant="outline" className={`flex items-center gap-1 font-bold tracking-wider uppercase text-[10px] ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority === "High" && <AlertTriangle className="h-3 w-3" />}
                  {ticket.priority} Priority
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground leading-tight">{ticket.subject}</h2>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 font-medium">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Raised on: {ticket.dateRaised}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 flex flex-col gap-6 bg-background">
          
          {/* Issue Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
              <MessageSquareText className="h-4 w-4" /> Issue Description
            </h3>
            <div className="bg-muted/10 border border-border/50 rounded-xl p-4 text-sm text-foreground leading-relaxed">
              {ticket.description || "No detailed description provided by the raiser."}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raised By Details */}
            <div className="bg-muted/10 border rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4" /> Raised By Department
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Department</p>
                  <p className="font-semibold text-foreground">{ticket.raisedByDept}</p>
                </div>
                <div className="pt-3 border-t border-border/50">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Head of Department (HOD)</p>
                  <p className="font-bold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-primary" /> {ticket.raisedByHodName || "N/A"}
                  </p>
                  <div className="flex flex-col gap-1.5 mt-2 text-xs text-muted-foreground">
                    {ticket.raisedByHodEmail && <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {ticket.raisedByHodEmail}</span>}
                    {ticket.raisedByHodPhone && <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {ticket.raisedByHodPhone}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned To Details */}
            <div className="bg-muted/10 border rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4" /> Assigned To
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Department</p>
                  <p className="font-semibold text-brand-primary">{ticket.assignedToDept}</p>
                </div>
                <div className="pt-3 border-t border-border/50">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Assigned Handler / Technician</p>
                  {ticket.handler ? (
                    <div className="flex items-center gap-3 bg-card border rounded-lg p-3 mt-1 shadow-sm">
                      <div className="bg-brand-primary/10 p-2 rounded-full text-brand-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{ticket.handler}</p>
                        <p className="text-xs text-muted-foreground">Assigned Technician</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground mt-2 italic text-sm">
                      <Clock className="h-4 w-4" /> Waiting for assignment...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Details (Simple) */}
          {ticket.status === "Completed" && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-brand-success" /> Resolution Notes
              </h3>
              <div className="bg-brand-success/5 border border-brand-success/20 rounded-xl p-4 text-sm text-foreground">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-brand-success flex items-center gap-2">
                    <User className="h-4 w-4" /> Resolved by: {ticket.handler}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono bg-background border border-border/50 px-2 py-1 rounded shadow-sm">
                    {mockResolutionDate} 04:30 PM
                  </span>
                </div>
                <p className="text-foreground leading-relaxed mt-3 pt-3 border-t border-brand-success/10">
                  {ticket.resolutionMessage || "Applied the necessary fixes and resolved the issue. Tested successfully with the user."}
                </p>
              </div>
            </div>
          )}

          {/* Pending/In-Progress Info */}
          {ticket.status !== "Completed" && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-brand-warning" /> Ticket Status
              </h3>
              <div className="bg-muted/10 border border-border/50 rounded-xl p-4 text-sm text-muted-foreground italic flex items-center gap-2">
                This ticket is currently <strong className="text-foreground font-semibold">{ticket.status}</strong>. 
                {ticket.status === "In Progress" ? " The assigned technician is actively working on a resolution." : " Awaiting technician assignment or initial review."}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
