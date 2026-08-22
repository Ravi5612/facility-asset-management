export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  assetsAssigned?: number;
  attendance?: string;
  salary?: string;
  performance?: string;
};

export type Department = {
  id: string;
  name: string;
  code?: string;
  imageUrl?: string;
  hod: string;
  employeeCount: number;
  status: "Active" | "Inactive";
  dateCreated?: string;
  description?: string;
  employees?: Employee[];
};

export type AssetItem = {
  id: string; 
  serialNumber: string; 
  purchaseDate: string;
  warrantyExpiry: string | null;
  status: "Assigned" | "Available" | "Dump" | "Repair";
  assignedTo: string | null; 
  assignedOn: string | null;
  dumpedOn: string | null; 
  repairedOn: string | null; 
  notes: string;
  history: { action: string; person: string; date: string; note: string }[];
};

export type AssetCategory = {
  category: string; 
  name: string; 
  prefix: string;
  isCustom?: boolean; 
  items: AssetItem[];
};

export type TicketStatus = "Pending" | "In Progress" | "Completed";
export type Priority = "High" | "Medium" | "Low";

export type InterDeptTicket = {
  id: string;
  subject: string;
  description: string;
  raisedByDept: string;
  raisedByHodName?: string;
  raisedByHodEmail?: string;
  raisedByHodPhone?: string;
  assignedToDept: string;
  handler: string | null;
  status: TicketStatus;
  priority: Priority;
  dateRaised: string;
  resolutionMessage?: string;
  history?: {
    action: string;
    date: string;
    actor: string;
    note: string;
  }[];
};

export interface SubAdmin {
  id: string;
  employeeCode?: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  departments: string[];
  createdAt: string;
  profileImage?: string;
  assignedAssets: number;
}

export type VisitorApprovalStatus = "Pending" | "Approved" | "Rejected";
export type VisitState = "Expected" | "Inside" | "Checked Out";

export interface Visitor {
  id: string;
  visitorName: string;
  visitorCompany?: string;
  phone: string;
  purpose: string;
  hostName: string;
  hostEmpCode: string;
  approvalStatus: VisitorApprovalStatus;
  visitState: VisitState;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
}
