import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--brand-primary-light)]">
        <Construction className="h-12 w-12 text-[var(--brand-primary)]" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-foreground mb-3">
        Upcoming Soon!
      </h1>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We are actively working on this module. This feature will be available in the upcoming release of the DR IT GROUP platform.
      </p>

      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary)]/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
