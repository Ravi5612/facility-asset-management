import { InterDeptTicket } from "@/types";

export const ticketService = {
  async getTickets(): Promise<any[]> {
    const res = await fetch("/api/tickets", {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch tickets: ${res.statusText}`);
    }
    
    return res.json();
  },

  async getOutboundTickets(): Promise<any[]> {
    const res = await fetch("/api/tickets/outbound", {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch outbound tickets: ${res.statusText}`);
    }
    
    return res.json();
  },

  async createTicket(data: any): Promise<any> {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to create ticket: ${res.statusText}`);
    }
    
    return res.json();
  }
};
