import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      {/* Table container */}
      <div className="rounded-md border p-4 space-y-4">
        {/* Header */}
        <div className="flex gap-4 border-b pb-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6 space-y-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        ))}
      </div>
      {/* Charts/Tables Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border p-6 space-y-4">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="col-span-3 rounded-xl border p-6 space-y-4">
          <Skeleton className="h-6 w-[150px]" />
          <div className="space-y-4 pt-4">
             {Array.from({ length: 5 }).map((_, j) => (
               <Skeleton key={j} className="h-12 w-full" />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="w-full space-y-6 p-6">
      <Skeleton className="h-10 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
      <TableSkeleton />
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 p-5 rounded-xl border bg-card text-left h-[180px]">
          <div className="flex justify-between w-full">
            <Skeleton className="h-6 w-[120px]" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </div>
          <div className="mt-auto pt-2">
             <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
