import { Badge } from "@/components/ui/badge";

type StatusVariant = "department" | "employee" | "asset" | "ticket" | "subadmin";

const STATUS_COLORS: Record<string, string> = {
  // Active / Available
  Active:    "bg-green-100 text-green-700",
  Available: "bg-green-100 text-green-700",
  Completed: "bg-green-100 text-green-700",

  // Pending / Repair
  Pending:   "bg-orange-100 text-orange-700",
  Repair:    "bg-yellow-100 text-yellow-700",

  // In Progress
  "In Progress": "bg-blue-100 text-blue-700",

  // Inactive / Dump / Inactive sub-admin
  Inactive: "bg-slate-100 text-slate-700",
  Dump:     "bg-red-100 text-red-700",
  Assigned: "bg-blue-100 text-blue-700",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700";
  const sizeClass = size === "sm" ? "text-[10px] py-0 h-5" : "text-xs";

  return (
    <Badge
      variant="secondary"
      className={`${colorClass} ${sizeClass} ${className}`}
    >
      {status}
    </Badge>
  );
}
