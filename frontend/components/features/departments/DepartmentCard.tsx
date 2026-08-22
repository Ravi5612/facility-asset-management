import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, Eye, Building2 } from "lucide-react";
import { Department } from "@/types";
import Image from "next/image";

interface DepartmentCardProps {
  dept: Department;
}

export function DepartmentCard({ dept }: DepartmentCardProps) {
  const router = useRouter();

  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {dept.imageUrl ? (
            <div className="h-12 w-12 rounded-lg overflow-hidden relative shrink-0 border border-border">
               <Image src={dept.imageUrl} alt={dept.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
               <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-foreground text-lg leading-tight">{dept.name}</h3>
            <p className="text-xs text-muted-foreground font-mono mt-1">{dept.code || dept.id.split('-')[0]}</p>
          </div>
        </div>
        <StatusBadge status={dept.status} />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 pl-1 flex-1">
        {dept.description}
      </p>

      <div className="bg-muted/30 rounded-lg p-3 space-y-2 mt-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">HOD</span>
          <span className="font-semibold text-foreground">{dept.hod}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Employees</span>
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            {dept.employeeCount}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all"
        onClick={() => router.push(`/superadmin/departments/${dept.id}`)}
      >
        <Eye className="h-4 w-4" /> View Details
      </Button>
    </div>
  );
}
