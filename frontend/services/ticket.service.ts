import { InterDeptTicket } from "@/types";

export const ticketService = {
  async getTickets(): Promise<any[]> {
    const res = await fetch("/api/tickets/all", {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch tickets: ${res.statusText}`);
    }
    
    return res.json();
  },

  async getOutboundTickets(): Promise<any[]> {
    const res = await fetch("/api/tickets/outbound");
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch outbound tickets");
    }
    return res.json();
  },

  async getAssignedToMeTickets(): Promise<any[]> {
    const res = await fetch("/api/tickets/assigned-to-me", {
      cache: "no-store",
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch assigned tickets");
    }
    return res.json();
  },

  async updateTicket(id: string, data: any): Promise<any> {
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
  async getInboundTickets(): Promise<any[]> {
    const res = await fetch("/api/tickets/inbound", {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch department tickets: ${res.statusText}`);
    }
    
    return res.json();
  },

  async createTicket(data: any): Promise<any> {
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
  },

  async getTicketSettings(): Promise<any> {
    const res = await fetch("/api/proxy/tickets/settings", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch ticket settings");
    return res.json();
  },

  async updateTicketSettings(data: { autoAssignEnabled?: boolean; rotationStaffIds?: string[] }): Promise<any> {
    const res = await fetch("/api/proxy/tickets/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update ticket settings");
    return res.json();
  },

  async requestHODApproval(ticketId: string): Promise<any> {
    const res = await fetch(`/api/proxy/tickets/${ticketId}/request-approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to request approval");
    }
    return res.json();
  },

  async hodDecision(ticketId: string, approved: boolean, note?: string): Promise<any> {
    const res = await fetch(`/api/proxy/tickets/${ticketId}/hod-decision`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved, note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to submit decision");
    }
    return res.json();
  },

  async rateTicket(ticketId: string, rating: number, feedback?: string): Promise<any> {
    const res = await fetch(`/api/proxy/tickets/${ticketId}/rate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, feedback }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to submit rating");
    }
    return res.json();
  }
};

