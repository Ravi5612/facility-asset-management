const API_URL = "/api/proxy";

export const inventoryService = {
  getAll: async (): Promise<any[]> => {
    const res = await fetch("/api/inventory");
    if (!res.ok) throw new Error("Failed to fetch inventory");
    return res.json();
  },
  getBySeat: async (seatNumber: string, floor?: string): Promise<any> => {
    const url = new URL(window.location.origin + "/api/proxy/inventory/by-seat");
    url.searchParams.append("seatNumber", seatNumber);
    if (floor) url.searchParams.append("floor", floor);
    
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch seat details");
    return res.json();
  }
};

