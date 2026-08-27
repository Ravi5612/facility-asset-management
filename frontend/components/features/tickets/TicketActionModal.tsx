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
}

export function TicketActionModal({ ticket, isOpen, setIsOpen, onSuccess }: TicketActionModalProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // When ticket changes, reset state
  useState(() => {
    if (ticket) {
      setStatus(ticket.status || "");
    }
  });

  // Fetch employees for this HOD's department
  const { data: employees = [], isLoading: isLoadingEmps } = useQuery({
    queryKey: ["my-employees"],
    queryFn: employeeApi.getEmployees,
    enabled: isOpen,
  });

  const { mutate: updateTicket, isPending } = useMutation({
    mutationFn: (data: { status?: string; assignedToEmployeeId?: string }) => {
      return ticketService.updateTicket(ticket!.id, data);
    },
    onSuccess: () => {
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["inbound-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["outbound-tickets"] });
      onSuccess?.();
    },
    onError: (err: Error) => {
      setSubmitError(err.message || "Failed to update ticket");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setSubmitError(null);
    updateTicket({
      status: status || undefined,
      assignedToEmployeeId: assigneeId && assigneeId !== "unassigned" ? assigneeId : undefined,
    });
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Update Ticket</DialogTitle>
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[var(--brand-primary)] text-white hover:opacity-90">
              {isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
