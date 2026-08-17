export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  // Future fields placeholders
  assetsAssigned?: number;
  attendance?: string;
  salary?: string;
  performance?: string;
};

export type Department = {
  id: string;
  name: string;
  hod: string;
  employeeCount: number;
  status: "Active" | "Inactive";
  dateCreated: string;
  description: string;
  employees: Employee[];
};

export const generateEmployees = (count: number, deptPrefix: string): Employee[] => {
  return Array.from({ length: Math.min(count, 50) }, (_, i) => ({
    id: `EMP-${deptPrefix}-${String(i + 1).padStart(3, "0")}`,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    role: i === 0 ? "Manager" : i % 5 === 0 ? "Senior Executive" : "Executive",
    status: i % 10 === 0 ? "Inactive" : "Active",
    assetsAssigned: i % 3 === 0 ? 2 : 1,
    attendance: `${90 + (i % 10)}%`,
    salary: `₹${(50000 + (i % 5) * 10000).toLocaleString()}`,
    performance: i % 7 === 0 ? "Needs Improvement" : i % 3 === 0 ? "Excellent" : "Good",
  }));
};

export const mockDepartments: Department[] = [
  { id: "DPT-001", name: "Information Technology", hod: "Ravi Rai", employeeCount: 145, status: "Active", dateCreated: "2020-01-15", description: "Handles all internal IT infrastructure and software development.", employees: generateEmployees(145, "IT") },
  { id: "DPT-002", name: "Human Resources", hod: "Sita Sharma", employeeCount: 12, status: "Active", dateCreated: "2020-01-20", description: "Responsible for hiring, employee relations, and company culture.", employees: generateEmployees(12, "HR") },
  { id: "DPT-003", name: "Finance", hod: "Amit Kumar", employeeCount: 28, status: "Active", dateCreated: "2020-02-10", description: "Manages company finances, payroll, and auditing.", employees: generateEmployees(28, "FIN") },
  { id: "DPT-004", name: "Marketing", hod: "Priya Singh", employeeCount: 42, status: "Active", dateCreated: "2020-03-05", description: "Handles brand presence, marketing campaigns, and social media.", employees: generateEmployees(42, "MKT") },
  { id: "DPT-005", name: "Operations", hod: "Rahul Verma", employeeCount: 85, status: "Active", dateCreated: "2020-04-12", description: "Ensures smooth day-to-day operations and logistics.", employees: generateEmployees(85, "OPS") },
  { id: "DPT-006", name: "Customer Support", hod: "Neha Gupta", employeeCount: 120, status: "Active", dateCreated: "2020-06-01", description: "Provides 24/7 support to customers.", employees: generateEmployees(120, "CS") },
  { id: "DPT-007", name: "Research & Development", hod: "Vikas Joshi", employeeCount: 35, status: "Inactive", dateCreated: "2021-01-10", description: "Focuses on future product innovations.", employees: generateEmployees(35, "RND") },
];
