import { InterDeptTicket } from "@/types";

export const ticketService = {
  async getTickets(): Promise<Record<string, unknown>[]> {
    const res = await fetch("/api/tickets/all", {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch tickets: ${res.statusText}`);
    }
    
    return res.json();
  },

  async getOutboundTickets(): Promise<Record<string, unknown>[]> {
    const res = await fetch("/api/tickets/outbound");
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch outbound tickets");
    }
    return res.json();
  },

  async getAssignedToMeTickets(): Promise<Record<string, unknown>[]> {
    const res = await fetch("/api/tickets/assigned-to-me", {
      cache: "no-store",
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch assigned tickets");
    }
    return res.json();
  },

  async updateTicket(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to update ticket");
    }
    
    return res.json();
  },

  // Tickets ASSIGNED TO my department (inbound — for HOD Tickets page)
  async getInboundTickets(): Promise<Record<string, unknown>[]> {
    const res = await fetch("/api/tickets/inbound", {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch department tickets: ${res.statusText}`);
    }
    
    return res.json();
  },

  async createTicket(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch("/api/tickets/all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Failed to create ticket");
    }
    
    return json;
  }
};
