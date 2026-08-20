"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Mail, BookOpen, Ticket, Clock, Activity, CheckCircle2, PlusCircle } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { Button } from "@/components/ui/button";
import { RaiseTicketModal } from "@/components/features/tickets/RaiseTicketModal";
import { ticketService } from "@/services/ticket.service";

export default function HelpPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: outboundTickets = [] } = useQuery({
    queryKey: ["outbound-tickets"],
    queryFn: ticketService.getOutboundTickets
  });

  // Calculate real stats
  const totalTickets = outboundTickets.length;
  const pendingTickets = outboundTickets.filter((t: any) => t.status === "OPEN").length;
  const inProgressTickets = outboundTickets.filter((t: any) => t.status === "IN_PROGRESS").length;
  const completedTickets = outboundTickets.filter((t: any) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <RaiseTicketModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-[var(--brand-primary)]" />
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your support tickets and get assistance from administration.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Raise New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Tickets"
          value={totalTickets}
          icon={<Ticket className="h-6 w-6" />}
          iconClassName="bg-blue-500/10 text-blue-500"
          lineClassName="bg-blue-500"
        />
        <SummaryCard
          label="Pending"
          value={pendingTickets}
          icon={<Clock className="h-6 w-6" />}
          iconClassName="bg-amber-500/10 text-amber-500"
          lineClassName="bg-amber-500"
        />
        <SummaryCard
          label="In Progress"
          value={inProgressTickets}
          icon={<Activity className="h-6 w-6" />}
          iconClassName="bg-purple-500/10 text-purple-500"
          lineClassName="bg-purple-500"
        />
        <SummaryCard
          label="Completed"
          value={completedTickets}
          icon={<CheckCircle2 className="h-6 w-6" />}
          iconClassName="bg-green-500/10 text-green-500"
          lineClassName="bg-green-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="h-10 w-10 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Documentation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Learn how to use the Asset Management portal, manage your employees, and raise tickets.
          </p>
          <a href="#" className="text-[var(--brand-primary)] text-sm font-medium hover:underline">
            View Guides &rarr;
          </a>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="h-10 w-10 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-lg flex items-center justify-center mb-4">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Contact Admin</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Facing technical issues? Drop an email to the super admin for direct support.
          </p>
          <a href="mailto:admin@dritgroup.com" className="text-[var(--brand-primary)] text-sm font-medium hover:underline">
            admin@dritgroup.com &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
