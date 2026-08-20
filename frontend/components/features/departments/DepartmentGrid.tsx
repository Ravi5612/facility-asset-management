import { Department } from "@/types";
import { DepartmentCard } from "./DepartmentCard";

interface DepartmentGridProps {
  departments: Department[];
}

export function DepartmentGrid({ departments }: DepartmentGridProps) {
  if (departments.length === 0) {
    return (
      <div className="col-span-full text-center py-12 bg-card rounded-xl border text-muted-foreground">
        No departments found matching your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {departments.map((dept) => (
        <DepartmentCard key={dept.id} dept={dept} />
      ))}
    </div>
  );
}
