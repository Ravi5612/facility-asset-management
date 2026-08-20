import { Visitor } from "@/types";
import { VisitorArraySchema } from "@/lib/validations/visitor";

let mockVisitors: Visitor[] = [
  {
    id: "VIS-001",
    visitorName: "Sunil Sharma",
    visitorCompany: "Tech Solutions",
    phone: "9876543210",
    purpose: "Vendor Meeting",
    hostName: "Ravi Rai",
    hostEmpCode: "EMP-001",
    approvalStatus: "Approved",
    visitState: "Inside",
    date: new Date().toISOString().split('T')[0],
    timeIn: "10:30 AM",
    timeOut: null,
  },
  {
    id: "VIS-002",
    visitorName: "Priya Singh",
    visitorCompany: "Interviewee",
    phone: "9876543211",
    purpose: "Job Interview",
    hostName: "Amit Kumar",
    hostEmpCode: "EMP-002",
    approvalStatus: "Pending",
    visitState: "Expected",
    date: new Date().toISOString().split('T')[0],
    timeIn: null,
    timeOut: null,
  },
];

export const visitorService = {
  async getVisitors(): Promise<Visitor[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = VisitorArraySchema.safeParse(mockVisitors);
    if (!result.success) {
      throw new Error(`Invalid visitor data format: ${result.error.message}`);
    }
    return result.data as Visitor[];
  },

  async addVisitor(data: Omit<Visitor, "id" | "approvalStatus" | "visitState" | "date" | "timeIn" | "timeOut">): Promise<Visitor> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newVisitor: Visitor = {
      ...data,
      id: `VIS-${String(mockVisitors.length + 1).padStart(3, "0")}`,
      approvalStatus: "Pending",
      visitState: "Expected",
      date: new Date().toISOString().split('T')[0],
      timeIn: null,
      timeOut: null,
    };
    
    mockVisitors = [newVisitor, ...mockVisitors];
    return newVisitor;
  },

  async updateVisitorStatus(id: string, action: "Approve" | "Reject" | "CheckIn" | "CheckOut"): Promise<Visitor> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const index = mockVisitors.findIndex(v => v.id === id);
    if (index === -1) throw new Error("Visitor not found");
    
    const visitor = { ...mockVisitors[index] };
    
    if (action === "Approve") {
      visitor.approvalStatus = "Approved";
    } else if (action === "Reject") {
      visitor.approvalStatus = "Rejected";
    } else if (action === "CheckIn") {
      visitor.visitState = "Inside";
      visitor.timeIn = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (action === "CheckOut") {
      visitor.visitState = "Checked Out";
      visitor.timeOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    mockVisitors[index] = visitor;
    return visitor;
  }
};
