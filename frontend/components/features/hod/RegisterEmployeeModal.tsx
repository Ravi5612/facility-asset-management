"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { employeeApi } from "@/services/employeeApi.service";
import { departmentService } from "@/services/department.service";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload } from "@/components/ui/image-upload";


const employeeFormSchema = z.object({
  // Basic Info
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 chars"),
  confirmPassword: z.string(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  profilePic: z.unknown().optional(),

  // Contact & Address
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  currentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),

  // Professional
  departmentName: z.string().min(1, "Department required"),
  designation: z.string().min(1, "Designation required"),
  qualification: z.string().optional(),
  lastSalary: z.string().optional(),
  offeredSalary: z.string().optional(),

  // Legal & Bank
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  aadharNumber: z.string().optional(),
  criminalCase: z.string().optional(),
  criminalDetails: z.string().optional(),

  // Medical
  illnesses: z.string().optional(),
  medication: z.string().optional(),

  // Documents
  aadharPhoto: z.unknown().optional(),
  educationPhoto: z.unknown().optional(),
  salaryProofPhoto: z.unknown().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface RegisterEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterEmployeeModal({ onClose, onSuccess }: RegisterEmployeeModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Current step state (for Tabs)
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch real departments
  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      gender: "Male",
      criminalCase: "No"
    }
  });

  const watchCriminalCase = watch("criminalCase");

  const registerMutation = useMutation({
    mutationFn: (data: EmployeeFormValues) => {
      return employeeApi.createEmployee(data as any);
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = (data: EmployeeFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">Register New Employee</h2>
            <p className="text-sm text-muted-foreground mt-1">Complete the onboarding form details below.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="register-employee-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            
            <div className="w-full flex overflow-x-auto hide-scrollbar bg-secondary rounded-lg p-1 space-x-1 shrink-0">
              {['basic', 'contact', 'professional', 'legal', 'docs'].map((tab) => {
                const labels: any = { basic: 'Basic Info', contact: 'Address & Contact', professional: 'Professional', legal: 'Legal & Bank', docs: 'Docs & Medical' };
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex-1 ${activeTab === tab ? 'bg-brand-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {labels[tab]}
                  </button>
                )
              })}
            </div>

            <div className="pt-4 animate-in slide-in-from-bottom-2">
              {/* BASIC INFO */}
              <div className={`space-y-4 ${activeTab === 'basic' ? 'block' : 'hidden'}`}>

                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32">
                    <ImageUpload 
                      value={null}
                      onChange={(file) => setValue("profilePic", file)}
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2">Profile Photo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <input {...register("name")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="John Doe" />
                    {errors.name && <p className="text-xs text-brand-error">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <input type="email" {...register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="john@example.com" />
                    {errors.email && <p className="text-xs text-brand-error">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-sm font-medium">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} {...register("password")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-brand-error">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-sm font-medium">Confirm Password *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-brand-error">{errors.confirmPassword.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Father's Name</label>
                    <input {...register("fatherName")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Father's Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mother's Name</label>
                    <input {...register("motherName")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Mother's Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth</label>
                    <input type="date" {...register("dob")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Blood Group</label>
                    <select {...register("bloodGroup")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <select {...register("gender")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={() => setActiveTab("contact")}>Next: Contact Details</Button>
                </div>
              </div>

              {/* CONTACT & ADDRESS */}
              <div className={`space-y-4 ${activeTab === 'contact' ? 'block' : 'hidden'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <input {...register("phone")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Emergency Contact</label>
                    <input {...register("emergencyContact")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Current Address</label>
                    <textarea {...register("currentAddress")} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Full current address..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Permanent Address</label>
                    <textarea {...register("permanentAddress")} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Full permanent address..." />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>Back</Button>
                  <Button type="button" onClick={() => setActiveTab("professional")}>Next: Professional</Button>
                </div>
              </div>

              {/* PROFESSIONAL */}
              <div className={`space-y-4 ${activeTab === 'professional' ? 'block' : 'hidden'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department *</label>
                    <select
                      {...register("departmentName")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      disabled={isLoadingDepts}
                    >
                      <option value="">Select Department</option>
                      {departments?.map((d: any) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    {errors.departmentName && <p className="text-xs text-brand-error">{errors.departmentName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Designation *</label>
                    <input {...register("designation")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="e.g. Software Engineer" />
                    {errors.designation && <p className="text-xs text-brand-error">{errors.designation.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Highest Qualification</label>
                    <input {...register("qualification")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="e.g. B.Tech Computer Science" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Drawn Salary</label>
                    <input type="number" {...register("lastSalary")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="₹" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Offered Salary</label>
                    <input type="number" {...register("offeredSalary")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="₹" />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("contact")}>Back</Button>
                  <Button type="button" onClick={() => setActiveTab("legal")}>Next: Legal & Bank</Button>
                </div>
              </div>

              {/* LEGAL & BANK */}
              <div className={`space-y-4 ${activeTab === 'legal' ? 'block' : 'hidden'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bank Name</label>
                    <input {...register("bankName")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="e.g. HDFC Bank" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account Number</label>
                    <input {...register("accountNumber")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Account Number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">IFSC Code</label>
                    <input {...register("ifscCode")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="IFSC Code" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aadhar Number</label>
                    <input {...register("aadharNumber")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="1234 5678 9012" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Any Criminal Cases?</label>
                    <select {...register("criminalCase")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  {watchCriminalCase === "Yes" && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Criminal Case Details</label>
                      <textarea {...register("criminalDetails")} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Please provide details..." />
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("professional")}>Back</Button>
                  <Button type="button" onClick={() => setActiveTab("docs")}>Next: Docs & Medical</Button>
                </div>
              </div>

              {/* DOCS & MEDICAL */}
              <div className={`space-y-4 ${activeTab === 'docs' ? 'block' : 'hidden'}`}>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Medical History / Illnesses</label>
                      <textarea {...register("illnesses")} rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Any existing conditions? (or 'None')" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Medication (if any)</label>
                      <textarea {...register("medication")} rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Any medicines running? (or 'None')" />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <h3 className="text-sm font-bold mb-4">Document Uploads</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Aadhar Photo */}
                      <div className="space-y-2 border rounded-lg p-3 bg-secondary/30">
                        <label className="text-xs font-medium">Aadhar Card Copy</label>
                        <div className="h-24 w-full">
                          <ImageUpload value={null} onChange={(file) => setValue("aadharPhoto", file)} />
                        </div>
                      </div>

                      {/* Education Certificate */}
                      <div className="space-y-2 border rounded-lg p-3 bg-secondary/30">
                        <label className="text-xs font-medium">Qualification Degree</label>
                        <div className="h-24 w-full">
                          <ImageUpload value={null} onChange={(file) => setValue("educationPhoto", file)} />
                        </div>
                      </div>

                      {/* Salary Proof */}
                      <div className="space-y-2 border rounded-lg p-3 bg-secondary/30">
                        <label className="text-xs font-medium">Last Salary Proof</label>
                        <div className="h-24 w-full">
                          <ImageUpload value={null} onChange={(file) => setValue("salaryProofPhoto", file)} />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 mt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("legal")}>Back</Button>
                  <Button type="submit" form="register-employee-form" disabled={registerMutation.isPending} className="bg-brand-primary text-primary-foreground hover:bg-brand-primary-dark w-40">
                    {registerMutation.isPending ? <Spinner size="sm" className="mr-2" /> : "Complete Registration"}
                  </Button>
                </div>
              </div>

            </div>
            
            {registerMutation.isError && (
              <div className="p-3 bg-brand-error/10 text-brand-error text-sm rounded-md border border-brand-error/20">
                {registerMutation.error instanceof Error ? registerMutation.error.message : "Failed to register employee"}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
