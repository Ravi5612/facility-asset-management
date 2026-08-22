import { DashboardSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="p-6 w-full h-full">
      {/* Title skeleton */}
      <div className="space-y-2 mb-8">
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>
      <DashboardSkeleton />
    </div>
  );
}
