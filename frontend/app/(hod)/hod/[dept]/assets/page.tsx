"use client";

import { useEffect, useState, useCallback } from "react";
import { HodAssetsClientPage } from "@/components/features/assets/HodAssetsClientPage";
import { PageLoader } from "@/components/ui/spinner";

export default function HodAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/assets/department", {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load assets");
      }
      const data = await res.json();
      setAssets(data);
    } catch (err: any) {
      setError(err.message || "Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  if (isLoading) return <PageLoader />;

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-2">
        <p className="text-brand-danger font-medium">{error}</p>
        <button
          onClick={fetchAssets}
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );

  return <HodAssetsClientPage initialAssets={assets} />;
}
