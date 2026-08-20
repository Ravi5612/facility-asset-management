"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Laptop, Mouse, Keyboard, CreditCard, Key, Headphones, Smartphone } from "lucide-react";
import { Employee } from "@/types";

interface EmployeeAssetsModalProps {
  employee: Employee;
}

// Generate mock assets based on the number assigned
function generateMockAssets(count: number, empId: string) {
  const assetTypes = [
    { category: "Laptop", icon: Laptop, dept: "IT" },
    { category: "Mouse", icon: Mouse, dept: "IT" },
    { category: "Keyboard", icon: Keyboard, dept: "IT" },
    { category: "Headset", icon: Headphones, dept: "IT" },
    { category: "ID Card", icon: CreditCard, dept: "HR" },
    { category: "Access Key", icon: Key, dept: "Admin" },
    { category: "Corporate Phone", icon: Smartphone, dept: "IT" },
  ];

  const assets = [];
  const total = count || 0;
  
  for (let i = 0; i < total; i++) {
    const type = assetTypes[i % assetTypes.length];
    assets.push({
      id: `AST-${empId}-${String(i + 1).padStart(3, "0")}`,
      name: `Company ${type.category}`,
      category: type.category,
      icon: type.icon,
      issuedBy: type.dept,
      issuedOn: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
      serialNo: `${type.category.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`
    });
  }
  
  return assets;
}

export function EmployeeAssetsModal({ employee }: EmployeeAssetsModalProps) {
  const [open, setOpen] = useState(false);
  const assetsAssigned = employee.assetsAssigned || 0;

  // Memoize so it doesn't regenerate on every render
  const assignedAssets = useMemo(() => generateMockAssets(assetsAssigned, employee.id), [assetsAssigned, employee.id]);

  if (assetsAssigned === 0) {
    return (
      <Badge variant="outline" className="gap-1 font-mono text-muted-foreground opacity-50">
        <FileText className="h-3 w-3" /> 0 Items
      </Badge>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center rounded-md border border-input bg-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 gap-1 font-mono cursor-pointer">
            <FileText className="h-3 w-3" /> {assetsAssigned} Items
          </button>
        }
      />
      
      <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Assigned Assets
            <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary">
              {assetsAssigned} Total
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Items currently issued to <strong>{employee.name}</strong> ({employee.id}).
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-1 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignedAssets.map((asset) => {
            const Icon = asset.icon;
            return (
              <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-muted/50 text-muted-foreground border">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{asset.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="font-mono">{asset.serialNo}</span>
                      <span>•</span>
                      <span>Issued: {asset.issuedOn}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">
                    Issued by: {asset.issuedBy}
                  </Badge>
                  <p className="text-xs text-brand-success font-medium mt-1">Status: Active</p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
