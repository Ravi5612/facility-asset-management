"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, AlertTriangle, Clock, Calendar, 
  User, Mail, Phone, Building2, CheckCircle2, MessageSquareText, Star
} from "lucide-react";
import { InterDeptTicket, Priority } from "@/types";
import { ticketService } from "@/services/ticket.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

interface TicketDetailsModalProps {
  ticket: InterDeptTicket;
}

function getPriorityColor(priority: Priority) {
  const p = priority?.toUpperCase();
  if (p === "HIGH" || p === "CRITICAL" || p === "URGENT") return "text-brand-danger bg-brand-danger/10 border-brand-danger/20";
  if (p === "MEDIUM") return "text-brand-warning bg-brand-warning/10 border-brand-warning/20";
  if (p === "LOW") return "text-brand-success bg-brand-success/10 border-brand-success/20";
  return "text-slate-600 bg-slate-100 border-slate-200";
}

export function TicketDetailsModal({ ticket }: TicketDetailsModalProps) {
  const [open, setOpen] = useState(false);
  
  // Calculate a mock resolution date based on raised date
  const resDate = new Date(ticket.dateRaised);
  resDate.setDate(resDate.getDate() + 2);
  const mockResolutionDate = resDate.toISOString().split("T")[0];

  const RATING_QUESTIONS = [
    "Was the issue resolved in a timely manner?",
    "Was the staff member's behavior polite and professional?",
    "Did the solution fully address your problem?",
    "Was the communication clear throughout the process?",
    "Are you satisfied with the overall support experience?"
  ];

  const queryClient = useQueryClient();
  const [checkedQuestions, setCheckedQuestions] = useState<boolean[]>(new Array(5).fill(false));
  const [feedbackVal, setFeedbackVal] = useState("");

  const currentRating = checkedQuestions.filter(Boolean).length;

  const rateMutation = useMutation({
    mutationFn: (data: { rating: number; feedback?: string }) => ticketService.rateTicket(ticket.dbId || ticket.id, data.rating, data.feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outbound-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["employee-tickets"] });
      alert("Rating submitted successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to submit rating");
    }
  });

  const authUserStr = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
  const user = authUserStr ? JSON.parse(authUserStr) : null;
  const isRaiser = user?.email === ticket.raisedByHodEmail;

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
        <div className={`bg-muted/30 p-6 border-b border-l-4 ${
            ticket.priority?.toUpperCase() === 'HIGH' || ticket.priority?.toUpperCase() === 'CRITICAL' ? 'border-l-brand-danger' : 
            ticket.priority?.toUpperCase() === 'MEDIUM' ? 'border-l-brand-warning' : 
            ticket.priority?.toUpperCase() === 'LOW' ? 'border-l-brand-success' : 'border-l-slate-300'
        }`}>
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="font-mono bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-sm">
                  {ticket.id}
                </Badge>
                <StatusBadge status={ticket.status} />
                <Badge variant="outline" className={`flex items-center gap-1 font-bold tracking-wider uppercase text-[10px] ${getPriorityColor(ticket.priority)}`}>
                  {(ticket.priority?.toUpperCase() === "HIGH" || ticket.priority?.toUpperCase() === "CRITICAL" || ticket.priority?.toUpperCase() === "URGENT") && <AlertTriangle className="h-3 w-3" />}
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
          {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'Completed') && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-brand-success" /> Resolution Details
              </h3>
              <div className="bg-brand-success/5 border border-brand-success/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-success/10 rounded-bl-full -z-10" />
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-brand-success/20 flex items-center justify-center text-brand-success shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{ticket.handler || "System Administrator"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Resolved on {ticket.resolvedAt ? new Date(ticket.resolvedAt).toISOString().split('T')[0] : mockResolutionDate}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-brand-success/10 text-brand-success rounded-full text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                  </span>
                </div>
                <p className="text-foreground leading-relaxed mt-3 pt-3 border-t border-brand-success/10">
                  {ticket.resolutionMessage || "Applied the necessary fixes and resolved the issue. Tested successfully with the user."}
                </p>
              </div>
            </div>
          )}

          {/* Rating Block for Resolved Tickets */}
          {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'Completed') && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-brand-warning" /> Ticket Rating
              </h3>
              
              {ticket.rating ? (
                <div className="bg-muted/10 border border-border/50 rounded-xl p-4">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-5 w-5 ${star <= ticket.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  {ticket.ratingFeedback && <p className="text-sm text-muted-foreground italic">"{ticket.ratingFeedback}"</p>}
                </div>
              ) : isRaiser ? (
                  <div className="bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200/50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm text-foreground font-medium">Please evaluate your experience by checking the boxes below:</p>
                      <div className="flex gap-1 ml-4 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 ${star <= currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 mb-5">
                      {RATING_QUESTIONS.map((question, index) => (
                        <label key={index} className="flex items-start gap-3 cursor-pointer group">
                          <Checkbox 
                            className="mt-0.5 border-yellow-400/50 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-white data-[state=checked]:border-yellow-400"
                            checked={checkedQuestions[index]}
                            onCheckedChange={(checked) => {
                              const newChecked = [...checkedQuestions];
                              newChecked[index] = checked as boolean;
                              setCheckedQuestions(newChecked);
                            }}
                          />
                          <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{question}</span>
                        </label>
                      ))}
                    </div>

                    {currentRating > 0 && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-yellow-200/50">
                        <textarea
                          value={feedbackVal}
                          onChange={(e) => setFeedbackVal(e.target.value)}
                          placeholder="Any additional feedback? (Optional)"
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <Button 
                          onClick={() => rateMutation.mutate({ rating: currentRating, feedback: feedbackVal })}
                          disabled={rateMutation.isPending}
                          className="w-full bg-brand-primary text-white"
                        >
                          {rateMutation.isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
                          Submit {currentRating} Star{currentRating !== 1 ? 's' : ''} Rating
                        </Button>
                      </div>
                    )}
                </div>
              ) : (
                <div className="bg-muted/10 border border-border/50 rounded-xl p-4 text-sm text-muted-foreground italic">
                  Waiting for user to rate this ticket.
                </div>
              )}
            </div>
          )}

          {/* Pending/In-Progress Info */}
          {(ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && ticket.status !== 'Completed') && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-brand-warning" /> Ticket Status
              </h3>
              <div className="bg-muted/10 border border-border/50 rounded-xl p-4 text-sm text-muted-foreground italic flex items-center gap-2">
                This ticket is currently <strong className="text-foreground font-semibold">{ticket.status}</strong>. 
                {ticket.status === "In Progress" || ticket.status === "IN_PROGRESS" ? " The assigned technician is actively working on a resolution." : " Awaiting technician assignment or initial review."}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
