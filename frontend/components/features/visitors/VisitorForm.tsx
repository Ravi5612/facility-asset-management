"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVisitorFormSchema, CreateVisitorFormValues } from "@/lib/validations/visitor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VisitorFormProps {
  onSubmit: (data: CreateVisitorFormValues) => void;
}

export function VisitorForm({ onSubmit }: VisitorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateVisitorFormValues>({
    resolver: zodResolver(createVisitorFormSchema),
    defaultValues: {
      visitorName: "",
      visitorCompany: "",
      phone: "",
      purpose: "",
      hostName: "",
      hostEmpCode: "",
    },
  });

  return (
    <form id="visitor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="visitorName">Visitor Name <span className="text-brand-danger">*</span></Label>
          <Input id="visitorName" {...register("visitorName")} placeholder="John Doe" />
          {errors.visitorName && <p className="text-xs text-brand-danger">{errors.visitorName.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number <span className="text-brand-danger">*</span></Label>
          <Input id="phone" {...register("phone")} placeholder="9876543210" />
          {errors.phone && <p className="text-xs text-brand-danger">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="visitorCompany">Company (Optional)</Label>
          <Input id="visitorCompany" {...register("visitorCompany")} placeholder="Tech Corp" />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="purpose">Purpose of Visit <span className="text-brand-danger">*</span></Label>
          <Input id="purpose" {...register("purpose")} placeholder="Meeting, Interview, etc." />
          {errors.purpose && <p className="text-xs text-brand-danger">{errors.purpose.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hostName">Host Name <span className="text-brand-danger">*</span></Label>
          <Input id="hostName" {...register("hostName")} placeholder="Employee Name" />
          {errors.hostName && <p className="text-xs text-brand-danger">{errors.hostName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hostEmpCode">Host Emp Code <span className="text-brand-danger">*</span></Label>
          <Input id="hostEmpCode" {...register("hostEmpCode")} placeholder="EMP-001" />
          {errors.hostEmpCode && <p className="text-xs text-brand-danger">{errors.hostEmpCode.message}</p>}
        </div>
      </div>
    </form>
  );
}
