"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Package, Search, MonitorPlay, UserCheck, Wrench, Trash2 } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";

import { AssignAssetModal } from "@/components/features/assets/AssignAssetModal";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function HodAssetsClientPage({ initialAssets }: { initialAssets: Record<string, unknown>[] }) {
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; name: string } | null>(null);

  const filteredAssets = initialAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.id.toLowerCase().includes(search.toLowerCase()) ||
      asset.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssets = initialAssets.length;
  const availableAssets = initialAssets.filter((a) => a.status === "Available").length;
  const assignedAssets = initialAssets.filter((a) => a.status === "Assigned").length;
  const maintenanceAssets = initialAssets.filter((a) => a.status === "Repair" || a.status === "Dump").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {selectedAsset && (
        <AssignAssetModal
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
          isOpen={!!selectedAsset}
          setIsOpen={(open) => !open && setSelectedAsset(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Department Assets</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View all assets assigned to your department.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search assets..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Assets"
          value={totalAssets}
          icon={<MonitorPlay className="h-6 w-6" />}
          iconClassName="bg-brand-primary-light text-brand-primary"
          lineClassName="bg-brand-primary"
        />
        <SummaryCard
          label="Available"
          value={availableAssets}
          icon={<Package className="h-6 w-6" />}
          iconClassName="bg-brand-success/10 text-brand-success"
          lineClassName="bg-brand-success"
        />
        <SummaryCard
          label="Assigned"
          value={assignedAssets}
          icon={<UserCheck className="h-6 w-6" />}
          iconClassName="bg-brand-warning/10 text-brand-warning"
          lineClassName="bg-brand-warning"
        />
        <SummaryCard
          label="Repair / Dumped"
          value={maintenanceAssets}
          icon={<Trash2 className="h-6 w-6" />}
          iconClassName="bg-brand-danger/10 text-brand-danger"
          lineClassName="bg-brand-danger"
        />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground">No assets found</h3>
            <p className="text-sm mt-1">No assets match your search or none are assigned to your department.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Asset ID</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Serial Number</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Assigned To</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-foreground bg-secondary px-2 py-1 rounded-md text-xs">
                        {asset.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {asset.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {asset.categoryName}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground text-xs">
                      {asset.serialNumber}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          asset.status === "Available"
                            ? "bg-brand-success/10 text-brand-success border-brand-success/20"
                            : asset.status === "Assigned"
                            ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                            : asset.status === "Repair"
                            ? "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                            : "bg-brand-danger/10 text-brand-danger border-brand-danger/20"
                        }
                      >
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {asset.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                            {asset.assignedTo.charAt(0)}
                          </div>
                          <span>{asset.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground/70">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {asset.status === "Available" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-brand-primary hover:text-brand-primary hover:bg-brand-primary/10"
                          onClick={() => setSelectedAsset({ id: asset.rawId, name: asset.name })} // using rawId
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
