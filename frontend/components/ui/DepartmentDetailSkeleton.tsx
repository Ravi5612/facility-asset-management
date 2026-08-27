export function DepartmentDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-muted animate-pulse" />
          <div>
            <div className="h-8 w-[250px] bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-[180px] bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Department Overview */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="h-6 w-[200px] bg-muted animate-pulse rounded mb-4" />
          <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-5 shadow-sm flex items-center justify-between">
              <div>
                <div className="h-4 w-[120px] bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 w-[60px] bg-muted animate-pulse rounded" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table Area */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
            <div className="h-6 w-[180px] bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-10 w-[250px] bg-muted animate-pulse rounded" />
              <div className="h-10 w-[120px] bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-4 border-b pb-4">
              <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
              <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
              <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
              <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-1/4 bg-muted animate-pulse rounded" />
                <div className="h-12 w-1/4 bg-muted animate-pulse rounded" />
                <div className="h-12 w-1/4 bg-muted animate-pulse rounded" />
                <div className="h-12 w-1/4 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
