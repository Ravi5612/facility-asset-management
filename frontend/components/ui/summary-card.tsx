import React from "react";
import { cn } from "@/lib/utils";

export interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconClassName?: string;
  lineClassName?: string;
  className?: string;
}

export function SummaryCard({
  label,
  value,
  icon,
  iconClassName = "bg-blue-100 text-blue-600",
  lineClassName = "bg-blue-500",
  className,
}: SummaryCardProps) {
  return (
    <div className={cn("group relative rounded-xl bg-card p-5 shadow-sm border overflow-hidden", className)}>
      <div
        className={cn(
          "absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-300 rounded-b-xl",
          lineClassName
        )}
      />
      <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-full text-xl", iconClassName)}>
        {icon}
      </div>
      <p className="mt-5 text-3xl font-extrabold text-slate-800">{value}</p>
      <p className="mt-2.5 text-sm font-semibold text-slate-600">{label}</p>
    </div>
  );
}
