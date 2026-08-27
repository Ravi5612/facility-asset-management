"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Ticket as TicketIcon, Paperclip } from "lucide-react";
import { departmentService } from "@/services/department.service";
import { ticketService } from "@/services/ticket.service";
import { Spinner } from "@/components/ui/spinner";


interface RaiseTicketModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export function RaiseTicketModal({ isOpen, setIsOpen, onSuccess }: RaiseTicketModalProps) {
  const queryClient = useQueryClient();
  const [departmentId, setDepartmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch departments so user can select WHICH department to send the ticket to
  const { data: departments = [], isLoading: isLoadingDept } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
    enabled: isOpen,
  });

  const { mutate: createTicket, isPending: isSubmitting } = useMutation({
    mutationFn: ticketService.createTicket,
    onSuccess: () => {
      setIsOpen(false);
      setSubject("");
      setDescription("");
      setDepartmentId("");
      setAttachment(null);
      // Refresh both outbound (help page) and inbound (tickets page)
      queryClient.invalidateQueries({ queryKey: ["outbound-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["inbound-tickets"] });
      onSuccess?.();
    },
    onError: (err: Error) => {
      setSubmitError(err.message || "Failed to raise ticket");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !subject || !description) return;
    setSubmitError(null);
    createTicket({
      assignedToDeptId: departmentId,
      subject,
      priority,
      description,
      attachmentUrl: attachment ? attachment.name : undefined
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-[var(--brand-primary)]" />
            Raise a New Ticket
          </DialogTitle>
          <DialogDescription>
            Need help? Raise a ticket and the responsible department will assist you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="to-dept">Send To Department <span className="text-red-500">*</span></Label>
            <select
              id="to-dept"
              required
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={isLoadingDept}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value="" disabled>Select the department</option>
              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Issue Subject <span className="text-red-500">*</span></Label>
            <input
              id="subject"
              required
              type="text"
              placeholder="e.g. Laptop charger not working"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Urgent (Critical Issue)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <textarea
              id="description"
              required
              placeholder="Please describe your issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment" className="flex items-center gap-1">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              Upload Image (Optional)
            </Label>
            <input
              id="attachment"
              type="file"
              accept="image/*"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--brand-primary)]/10 file:text-[var(--brand-primary)] hover:file:bg-[var(--brand-primary)]/20 cursor-pointer"
            />
          </div>

          {submitError && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {submitError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white"
              disabled={isSubmitting || !departmentId || !subject || !description}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="xs" className="mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
