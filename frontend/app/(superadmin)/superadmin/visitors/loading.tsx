import { TableSkeleton } from "@/components/ui/skeletons";

export default function VisitorsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-8">
        <div className="h-8 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>
      <div className="p-4 border rounded-lg bg-muted/20 mb-6 h-16 w-full animate-pulse"></div>
      <div className="border rounded-lg bg-card shadow-sm p-4">
        <TableSkeleton />
      </div>
    </div>
  );
}
