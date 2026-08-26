export default function Loading() {
  return (
    <div className="p-6 w-full h-full space-y-6">
      <div className="space-y-2 mb-8">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>
      <div className="h-[60vh] w-full bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-slate-300 dark:border-slate-600 border-t-brand-primary animate-spin"></div>
      </div>
    </div>
  );
}