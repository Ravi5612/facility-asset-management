export interface SubAdmin {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  departments: string[];
  createdAt: string;
}

// Initial Mock Data
let mockSubAdmins: SubAdmin[] = [
  {
    id: "SA-001",
    name: "Ravi Rai",
    email: "ravi.rai@dritgroup.com",
    status: "Active",
    departments: ["IT", "HR"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "SA-002",
    name: "Amit Kumar",
    email: "amit.kumar@dritgroup.com",
    status: "Active",
    departments: ["Finance"],
    createdAt: new Date().toISOString(),
  },
];

export const subAdminService = {
  /**
   * Fetch all sub-admins
   */
  async getSubAdmins(): Promise<SubAdmin[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockSubAdmins];
  },

  /**
   * Add a new sub-admin
   */
  async addSubAdmin(data: Omit<SubAdmin, "id" | "createdAt">): Promise<SubAdmin> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newAdmin: SubAdmin = {
      ...data,
      id: `SA-${String(mockSubAdmins.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
    };
    
    mockSubAdmins = [newAdmin, ...mockSubAdmins];
    return newAdmin;
  }
};
