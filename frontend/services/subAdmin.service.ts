import { SubAdmin } from "@/types";
// Initial Mock Data
let mockSubAdmins: SubAdmin[] = [
  {
    id: "SA-001",
    name: "Ravi Rai",
    email: "ravi.rai@dritgroup.com",
    status: "Active",
    departments: ["IT", "HR"],
    createdAt: new Date().toISOString(),
    assignedAssets: 12,
  },
  {
    id: "SA-002",
    name: "Amit Kumar",
    email: "amit.kumar@dritgroup.com",
    status: "Active",
    departments: ["Finance"],
    createdAt: new Date().toISOString(),
    assignedAssets: 3,
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
  async addSubAdmin(data: Omit<SubAdmin, "id" | "createdAt" | "assignedAssets">): Promise<SubAdmin> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newAdmin: SubAdmin = {
      ...data,
      id: `SA-${String(mockSubAdmins.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      assignedAssets: 0,
    };
    
    mockSubAdmins = [newAdmin, ...mockSubAdmins];
    return newAdmin;
  },

  /**
   * Update an existing sub-admin
   */
  async updateSubAdmin(
    id: string,
    data: Partial<Omit<SubAdmin, "id" | "createdAt">>
  ): Promise<SubAdmin> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const index = mockSubAdmins.findIndex((admin) => admin.id === id);
    if (index === -1) {
      throw new Error("Sub Admin not found");
    }
    
    const updatedAdmin: SubAdmin = {
      ...mockSubAdmins[index],
      ...data,
    };
    
    mockSubAdmins[index] = updatedAdmin;
    return updatedAdmin;
  },

  /**
   * Delete a sub-admin
   */
  async deleteSubAdmin(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const index = mockSubAdmins.findIndex((admin) => admin.id === id);
    if (index === -1) {
      throw new Error("Sub Admin not found");
    }
    
    mockSubAdmins = mockSubAdmins.filter((admin) => admin.id !== id);
  },
};
