"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InterDeptTicket } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { ticketService } from "@/services/ticket.service";
import { employeeApi } from "@/services/employeeApi.service";

interface TicketActionModalProps {
  ticket: InterDeptTicket | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess?: () => void;
  canAssign?: boolean;
}

export function TicketActionModal({ ticket, isOpen, setIsOpen, onSuccess, canAssign = true }: TicketActionModalProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");

  // When ticket changes, reset state
  useState(() => {
    if (ticket) {
      setStatus(ticket.status || "");
      setResolutionNotes((ticket as any).resolutionNotes || "");
    }
  });

  // Fetch employees for this HOD's department
  const { data: employees = [], isLoading: isLoadingEmps } = useQuery({
    queryKey: ["my-employees"],
    queryFn: employeeApi.getEmployees,
    enabled: isOpen,
  });

  const { mutate: updateTicket, isPending } = useMutation({
    mutationFn: (data: { status?: string; assignedToEmployeeId?: string; resolutionNotes?: string }) => {
      return ticketService.updateTicket((ticket as any)!.dbId || ticket!.id, data);
    },
    onSuccess: () => {
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["inbound-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["outbound-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["employee-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onSuccess?.();
    },
    onError: (err: Error) => {
      setSubmitError(err.message || "Failed to update ticket");
    }
  });

  const isResolved = ticket?.status === "RESOLVED" || ticket?.status === "CLOSED";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setSubmitError(null);
    updateTicket({
      status: status || undefined,
      assignedToEmployeeId: assigneeId && assigneeId !== "unassigned" ? assigneeId : undefined,
      resolutionNotes: resolutionNotes || undefined,
    });
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center pr-6">
            {isResolved && !canAssign ? "Ticket Details" : "Update Ticket"}
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wider uppercase border
              ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : ticket.status === 'IN_PROGRESS' 
                  ? 'bg-blue-100 text-blue-700 border-blue-200' 
                  : 'bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              {ticket.status === 'OPEN' ? 'PENDING' : ticket.status?.replace('_', ' ')}
            </span>
          </DialogTitle>
          <DialogDescription>
            {ticket.subject} ({ticket.id})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {submitError && (
            <div className="p-3 text-sm bg-brand-danger/10 text-brand-danger border border-brand-danger/20 rounded-md">
              {submitError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isResolved && !canAssign}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!canAssign ? (
                <>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Completed (Resolved)</option>
                </>
              ) : (
                <>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </>
              )}
            </select>
          </div>

          {!canAssign && (
            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">Problem Description & Solution Details</Label>
              <textarea
                id="resolutionNotes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                disabled={isResolved && !canAssign}
                placeholder="Briefly describe what the issue was and how you resolved it..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          {!canAssign && ticket.status === 'IN_PROGRESS' && !(ticket as any).hodApprovalStatus && (
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200">
              <h4 className="text-sm font-semibold text-orange-800 mb-1">Hardware Move Required?</h4>
              <p className="text-xs text-orange-600 mb-3">If resolving this ticket requires moving hardware, you must get HOD approval first.</p>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full text-orange-600 border-orange-200 hover:bg-orange-100"
                onClick={async () => {
                  if (confirm('Request HOD approval for hardware move?')) {
                    try {
                      await ticketService.requestHODApproval((ticket as any).dbId || ticket.id);
                      queryClient.invalidateQueries({ queryKey: ["employee-tickets"] });
                      setIsOpen(false);
                      alert('Approval requested successfully.');
                    } catch (err: any) {
                      alert(err.message || 'Failed to request approval');
                    }
                  }
                }}
              >
                Request HOD Approval
              </Button>
            </div>
          )}

          {!canAssign && (ticket as any).hodApprovalStatus && (
            <div className={`p-4 rounded-lg border ${
              (ticket as any).hodApprovalStatus === 'PENDING' ? 'bg-blue-50 border-blue-200' :
              (ticket as any).hodApprovalStatus === 'APPROVED' ? 'bg-green-50 border-green-200' :
              'bg-red-50 border-red-200'
            }`}>
              <h4 className={`text-sm font-semibold mb-1 ${
                (ticket as any).hodApprovalStatus === 'PENDING' ? 'text-blue-800' :
                (ticket as any).hodApprovalStatus === 'APPROVED' ? 'text-green-800' :
                'text-red-800'
              }`}>
                HOD Approval: {(ticket as any).hodApprovalStatus}
              </h4>
              {(ticket as any).hodApprovalNote && (
                <p className="text-xs mt-2 italic text-muted-foreground">Note: {(ticket as any).hodApprovalNote}</p>
              )}
            </div>
          )}


          {canAssign && (
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To Employee</Label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="unassigned">-- Select Employee --</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.employeeCode ? `(${emp.employeeCode})` : ''}
                  </option>
                ))}
              </select>
              {ticket.handler && !assigneeId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Currently handled by: {ticket.handler}
                </p>
              )}
            </div>
          )}

          {canAssign && (ticket as any).hodApprovalStatus === 'PENDING' && (
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200">
              <h4 className="text-sm font-semibold text-orange-800 mb-1">Approval Requested</h4>
              <p className="text-xs text-orange-600 mb-3">Staff has requested approval to move hardware for this ticket.</p>
              
              <div className="space-y-2 mb-3">
                <Label htmlFor="hodNote" className="text-xs text-orange-700">Reason / Note (optional)</Label>
                <textarea
                  id="hodNote"
                  className="flex min-h-[60px] w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={async () => {
                    const note = (document.getElementById('hodNote') as HTMLTextAreaElement)?.value;
                    try {
                      await ticketService.hodDecision((ticket as any).dbId || ticket.id, true, note);
                      queryClient.invalidateQueries({ queryKey: ["inbound-tickets"] });
                      setIsOpen(false);
                      alert('Approved');
                    } catch (err: any) { alert(err.message); }
                  }}
                >
                  Approve
                </Button>
                <Button 
                  type="button" 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={async () => {
                    const note = (document.getElementById('hodNote') as HTMLTextAreaElement)?.value;
                    try {
                      await ticketService.hodDecision((ticket as any).dbId || ticket.id, false, note);
                      queryClient.invalidateQueries({ queryKey: ["inbound-tickets"] });
                      setIsOpen(false);
                      alert('Rejected');
                    } catch (err: any) { alert(err.message); }
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            {!isResolved || canAssign ? <Button type="submit" disabled={isPending} className="bg-[var(--brand-primary)] text-white hover:opacity-90">
              {isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Save Changes
            </Button> : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
