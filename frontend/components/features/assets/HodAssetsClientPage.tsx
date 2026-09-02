// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Package, Search, MonitorPlay, UserCheck, Wrench, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { AssignAssetModal } from "@/components/features/assets/AssignAssetModal";
import { AllocateToDeptModal } from "@/components/features/assets/AllocateToDeptModal";
import { ShiftAssetModal } from "@/components/features/assets/ShiftAssetModal";
import { UpdateStatusModal } from "@/components/features/assets/UpdateStatusModal";
import { AddAssetModal } from "@/components/features/assets/AddAssetModal";
import { AssetCategoryCard } from "@/components/features/assets/AssetCategoryCard";
import { AssetDetailModal } from "@/components/features/assets/AssetDetailModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { assetService } from "@/services/asset.service";
import { AssetItem, AssetCategory } from "@/types";

interface HodAssetsClientPageProps {
  initialAssets: any[];
  isStockView?: boolean;
  onAssetAdded?: () => void;
}

export function HodAssetsClientPage({ initialAssets, isStockView = false, onAssetAdded }: HodAssetsClientPageProps) {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const isStoreHOD = user?.role === "HOD" && (user?.departmentName?.toLowerCase().includes("store") || user?.departmentName?.toLowerCase().includes("inventory"));

  const [viewMode, setViewMode] = useState<"own" | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<AssetItem | null>(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [detailStatusFilter, setDetailStatusFilter] = useState("All");
  const [detailPage, setDetailPage] = useState(1);
  const itemsPerPage = 8;
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);

  // Re-fetch categories ONLY if store HOD needs to add assets
  const { data: rawCategories = [], refetch: refetchCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: assetService.getCategories,
    enabled: isStoreHOD,
  });

  function generatePrefix(name: string) {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) return name.substring(0, 3).toUpperCase();
    return words.slice(0, 3).map(w => w[0]).join("").toUpperCase();
  }

  function getNextId(categoryName: string): string {
    if (!categoryName) return "";
    const catList = Array.isArray(rawCategories) ? rawCategories : (rawCategories as any)?.data || [];
    const cat = catList.find((c: any) => c.category === categoryName || c.name === categoryName);
    const prefix = cat?.prefix ?? generatePrefix(categoryName);
    const count = (cat?.items?.length ?? 0) + 1;
    return `${prefix}-${String(count).padStart(3, "0")}`;
  }

  function handleAddCategory() {
    refetchCategories();
  }

  const filteredAssets = useMemo(() => {
    return initialAssets.filter((asset: any) => {
      if (!isStoreHOD) return true;
      if (viewMode === "own") {
        return asset.departmentName?.toLowerCase().includes("store") || asset.departmentName?.toLowerCase().includes("inventory");
      }
      return true;
    });
  }, [initialAssets, isStoreHOD, viewMode]);

  // Group assets into categories for the cards
  const allCategories = useMemo(() => {
    const map = new Map<string, AssetCategory>();
    filteredAssets.forEach((asset: any) => {
      const catName = asset.categoryName || "Uncategorized";
      if (!map.has(catName)) {
        map.set(catName, {
          category: catName,
          name: catName,
          prefix: generatePrefix(catName),
          items: []
        });
      }
      
      let finalStatus = asset.status as string;
      let finalAssignee = asset.assignee;
      let canAction = true;

      // In Stock View, Store HOD shouldn't see end-user assignees of other departments
      if (isStockView) {
        const isStoreAssetLocal = !asset.departmentName || asset.departmentName.toLowerCase().includes('store') || asset.departmentName.toLowerCase().includes('inventory');
        if (!isStoreAssetLocal) {
          // If allocated to another dept, the status for Store is just "Assigned" (unless it's in repair/dump)
          if (finalStatus !== "Repair" && finalStatus !== "Dump" && finalStatus !== "RETIRED" && finalStatus !== "Returned") {
            finalStatus = "Assigned";
          }
          finalAssignee = "-"; // Hide employee/seat info
          canAction = false; // Store cannot take action on assets currently held by other departments
        } else {
          finalAssignee = "-"; // If it's in store, it's not assigned to an employee yet
        }
      }

      map.get(catName)!.items.push({
        ...asset,
        id: asset.id,
        rawId: asset.rawId || asset.id,
        name: asset.name,
        status: finalStatus,
        assignee: finalAssignee,
        serialNumber: asset.serialNumber,
        departmentName: asset.departmentName,
        canAction: canAction,
        history: asset.history || [],
      } as any);
    });
    
    let result = Array.from(map.values());
    if (search) {
      result = result.filter(c => c.category.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [filteredAssets, search]);

  // Helper to check if asset belongs to Store/Inventory
  const isStoreAsset = (a: any) => !a.departmentName || a.departmentName.toLowerCase().includes('store') || a.departmentName.toLowerCase().includes('inventory');

  const totalAssets = filteredAssets.length;
  
  // Assigned: Given to any OTHER department (not store), and not returned/dumped yet
  const assignedAssets = filteredAssets.filter((a: any) => !isStoreAsset(a) && a.status !== "Repair" && a.status !== "IN_MAINTENANCE" && a.status !== "Dump" && a.status !== "RETIRED" && a.status !== "Returned").length;
  
  // In Stock: Held by store AND is available
  const inStockAssets = filteredAssets.filter((a: any) => isStoreAsset(a) && (a.status === "Available" || a.status === "AVAILABLE")).length;
  
  // Returned/Maintenance
  const returnedAssets = filteredAssets.filter((a: any) => a.status === "Returned" || a.status === "RETURNED" || a.status === "Repair" || a.status === "IN_MAINTENANCE").length;
  
  // Dumped
  const dumpedAssets = filteredAssets.filter((a: any) => a.status === "Dump" || a.status === "RETIRED").length;

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedCategory.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(detailSearch.toLowerCase()) || 
                            item.id.toLowerCase().includes(detailSearch.toLowerCase());
      const matchesStatus = detailStatusFilter === "All" || item.status === detailStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [selectedCategory, detailSearch, detailStatusFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice((detailPage - 1) * itemsPerPage, detailPage * itemsPerPage);

  const [assignAssetId, setAssignAssetId] = useState<string | null>(null);
  const [allocateAssetId, setAllocateAssetId] = useState<string | null>(null);
  const [shiftAssetId, setShiftAssetId] = useState<string | null>(null);
  const [updateStatusAssetId, setUpdateStatusAssetId] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {allocateAssetId && (
        <AllocateToDeptModal
          assetId={allocateAssetId}
          assetName={filteredItems.find(i => (i as any).rawId === allocateAssetId)?.name || ""}
          isOpen={!!allocateAssetId}
          setIsOpen={(open) => !open && setAllocateAssetId(null)}
        />
      )}
      {assignAssetId && (
        <AssignAssetModal
          assetId={assignAssetId}
          assetName={filteredItems.find(i => (i as any).rawId === assignAssetId)?.name || ""}
          categoryName={(filteredItems.find(i => (i as any).rawId === assignAssetId) as any)?.categoryName || "CPU"} asset={filteredItems.find(i => (i as any).rawId === assignAssetId)}
          isOpen={!!assignAssetId}
          setIsOpen={(open) => !open && setAssignAssetId(null)}
        />
      )}
      {shiftAssetId && (
        <ShiftAssetModal
          assetId={shiftAssetId}
          assetName={filteredItems.find(i => (i as any).rawId === shiftAssetId)?.name || ""}
          isOpen={!!shiftAssetId}
          setIsOpen={(open) => !open && setShiftAssetId(null)}
        />
      )}
      {updateStatusAssetId && (
        <UpdateStatusModal
          assetId={updateStatusAssetId}
          assetName={filteredItems.find(i => (i as any).rawId === updateStatusAssetId)?.name || ""}
          currentStatus={filteredItems.find(i => (i as any).rawId === updateStatusAssetId)?.status || ""}
          isOpen={!!updateStatusAssetId}
          setIsOpen={(open) => !open && setUpdateStatusAssetId(null)}
        />
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{isStockView ? "Central Stock" : "Department Assets"}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isStockView ? "Manage all company assets, add new stock, and track allocations." : "View and manage assets assigned to your department."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* We hide the All/Own toggle because it's replaced by the two distinct pages */}
          {isStoreHOD && isStockView && (
            <AddAssetModal
              allCategories={rawCategories as any}
              onAddCategory={handleAddCategory}
              getNextId={getNextId}
              generatePrefix={generatePrefix}
              isOpen={isAddAssetOpen}
              setIsOpen={setIsAddAssetOpen}
              onSuccessCallback={onAssetAdded}
            />
          )}
          <SearchInput
            placeholder="Search categories..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-64"
          />
        </div>
      </div>

        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isStockView ? 'lg:grid-cols-5' : 'lg:grid-cols-3'}`}>
          <SummaryCard
            label="Total Assets"
            value={totalAssets}
            icon={<MonitorPlay className="h-6 w-6" />}
            iconClassName="bg-brand-primary-light text-brand-primary"
            lineClassName="bg-brand-primary"
          />
          <SummaryCard
            label="Assigned"
            value={assignedAssets}
            icon={<UserCheck className="h-6 w-6" />}
            iconClassName="bg-brand-warning/10 text-brand-warning"
            lineClassName="bg-brand-warning"
          />
          <SummaryCard
            label={isStockView ? "In Stock" : "Available"}
            value={inStockAssets}
            icon={<Package className="h-6 w-6" />}
            iconClassName="bg-brand-success/10 text-brand-success"
            lineClassName="bg-brand-success"
          />
          {isStockView && (
            <>
              <SummaryCard
                label="Returned"
                value={returnedAssets}
                icon={<Wrench className="h-6 w-6" />}
                iconClassName="bg-brand-error/10 text-brand-error"
                lineClassName="bg-brand-error"
              />
              <SummaryCard
                label="Dump / Retired"
                value={dumpedAssets}
                icon={<Trash2 className="h-6 w-6" />}
                iconClassName="bg-gray-100 text-gray-500"
                lineClassName="bg-gray-500"
              />
            </>
          )}
        </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allCategories.map(cat => (
          <AssetCategoryCard 
            key={cat.category}
            cat={cat}
            isStockView={isStockView}
            onSelect={(c) => {
              setSelectedCategory(c);
              setDetailSearch("");
              setDetailStatusFilter("All");
              setDetailPage(1);
            }}
          />
        ))}
      </div>
      
      {allCategories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-lg border border-border/50 border-dashed">
          No categories found.
        </div>
      )}

      {/* Category Detail Modal */}
      <Dialog open={!!selectedCategory} onOpenChange={open => { if (!open) { setSelectedCategory(null); setSelectedItem(null); } }}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] flex flex-col overflow-hidden">
          {selectedCategory && !selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedCategory.name} - Full Inventory</DialogTitle>
                <DialogDescription>
                  Total: {selectedCategory.items.length} | Assigned: {selectedCategory.items.filter(i => i.status === "Assigned").length} | Available: {selectedCategory.items.filter(i => i.status === "Available").length}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col sm:flex-row gap-3 py-4">
                <SearchInput placeholder="Search within category..." value={detailSearch} onChange={(val) => { setDetailSearch(val); setDetailPage(1); }} className="w-full sm:w-64" />
                <div className="flex bg-secondary p-1 rounded-md overflow-x-auto hide-scrollbar shrink-0">
                  {["All", "Available", "Assigned", "Repair", "Dump"].map(s => (
                    <button key={s} onClick={() => { setDetailStatusFilter(s); setDetailPage(1); }} className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors whitespace-nowrap ${detailStatusFilter === s ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border rounded-md overflow-hidden flex-1 flex flex-col min-h-0 bg-card">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 sticky top-0 z-10 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">Asset ID</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Serial No</th>
                        {isStoreHOD && <th className="px-4 py-3 font-medium">Department</th>}
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Assignee</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-4 py-3"><span className="font-mono bg-secondary px-2 py-1 rounded-md text-xs">{item.id}</span></td>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.serialNumber || '-'}</td>
                          {isStoreHOD && <td className="px-4 py-3 text-muted-foreground">{item.departmentName || '-'}</td>}
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={item.status === 'Available' ? 'border-brand-success text-brand-success bg-brand-success/10' : item.status === 'Assigned' ? 'border-brand-warning text-brand-warning bg-brand-warning/10' : 'border-brand-error text-brand-error bg-brand-error/10'}>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{item.assignee || '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-brand-primary" onClick={() => setSelectedItem(item)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {item.status === "Available" && item.canAction !== false && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-brand-primary" onClick={() => isStockView ? setAllocateAssetId(item.rawId) : setAssignAssetId(item.rawId)}>
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                              {(item.status === "Available" || item.status === "Repair") && item.canAction !== false && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-brand-primary" onClick={() => setUpdateStatusAssetId(item.rawId)}>
                                  <Wrench className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedItems.length === 0 && (
                        <tr>
                          <td colSpan={isStoreHOD ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">No assets found in this category matching your filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Page {detailPage} of {totalPages}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDetailPage(p => Math.max(1, p - 1))} disabled={detailPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setDetailPage(p => Math.min(totalPages, p + 1))} disabled={detailPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AssetDetailModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
    </div>
  );
}
