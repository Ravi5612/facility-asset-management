"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, PlusCircle, Laptop, Monitor, Mouse, Keyboard,
  Package, Eye, User, Calendar, Cable, ChevronLeft, ChevronRight, FolderPlus
} from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";

import { AssetItem, AssetCategory } from "@/types";
import { staticAssetsData } from "@/lib/mock-data/assets";
import { AssetCategoryCard } from "@/components/features/assets/AssetCategoryCard";
import { MOCK_API } from "@/lib/constants";
import { SuccessAlert } from "@/components/ui/alert-box";
import { AddAssetModal } from "@/components/features/assets/AddAssetModal";
import { AssetDetailModal } from "@/components/features/assets/AssetDetailModal";

/* ─── AUTO PREFIX GENERATOR ─── */
function generatePrefix(name: string): string {
  const words = name.trim().toUpperCase().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0] + (words[2]?.[0] ?? words[0][1] ?? "X")).slice(0, 3);
  return words[0].slice(0, 3).padEnd(3, "X");
}


function getCategoryIcon(category: string) {
  if (category === "Laptop") return Laptop;
  if (category === "Monitor") return Monitor;
  if (category === "Mouse") return Mouse;
  if (category === "Keyboard") return Keyboard;
  if (category === "Cable") return Cable;
  return Package;
}



function getActionColor(action: string) {
  if (action === "Purchased") return "bg-brand-primary";
  if (action === "Assigned" || action === "Reassigned") return "bg-brand-success";
  if (action === "Returned") return "bg-brand-orange";
  if (action === "Dumped") return "bg-brand-danger";
  if (action === "Sent for Repair") return "bg-brand-warning";
  return "bg-gray-400";
}

const DETAIL_PAGE_SIZE = 8;

/* ═══════════════════════════════════════════ */
export function AssetsClientPage({ initialCategories }: { initialCategories: AssetCategory[] }) {
  const [isAddOpen, setIsAddOpen]       = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [success, setSuccess]           = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<AssetItem | null>(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [detailStatusFilter, setDetailStatusFilter] = useState("All");
  const [detailPage, setDetailPage]     = useState(1);
  const [selectedFormCat, setSelectedFormCat] = useState("");

  // Custom categories state
  const [customCategories, setCustomCategories] = useState<AssetCategory[]>([]);

  // Add Category dialog
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName]     = useState("");
  const [newCatPrefix, setNewCatPrefix] = useState("");

  // All categories merged
  const allCategories = useMemo<AssetCategory[]>(() => [
    ...initialCategories,
    ...customCategories,
  ], [initialCategories, customCategories]);

  function handleAddCategory() {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const prefix = newCatPrefix.trim().toUpperCase() || generatePrefix(trimmed);
    // avoid duplicate
    if (allCategories.find(c => c.category.toLowerCase() === trimmed.toLowerCase())) {
      alert("Category already exists!"); return;
    }
    setCustomCategories(prev => [...prev, { category: trimmed, name: trimmed, prefix, isCustom: true, items: [] }]);
    setIsAddCatOpen(false);
    setNewCatName(""); setNewCatPrefix("");
    // Auto-select new cat in form
    setSelectedFormCat(trimmed);
  }

  function getNextId(category: string): string {
    const cat = allCategories.find(c => c.category === category);
    const prefix = cat?.prefix ?? generatePrefix(category);
    const count = (cat?.items.length ?? 0) + 1;
    return `${prefix}-${String(count).padStart(3, "0")}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false); setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setSelectedFormCat("");
      setTimeout(() => setSuccess(false), 3000);
    }, MOCK_API.DELAY_NORMAL);
  };

  const totalAssets   = allCategories.reduce((s, c) => s + c.items.length, 0);
  const totalAssigned = allCategories.reduce((s, c) => s + c.items.filter(i => i.status === "Assigned").length, 0);
  const totalDump     = allCategories.reduce((s, c) => s + c.items.filter(i => i.status === "Dump").length, 0);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedCategory.items.filter(item => {
      const ms = item.id.toLowerCase().includes(detailSearch.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(detailSearch.toLowerCase()) ||
        (item.assignedTo?.toLowerCase().includes(detailSearch.toLowerCase()) ?? false);
      const mst = detailStatusFilter === "All" || item.status === detailStatusFilter;
      return ms && mst;
    });
  }, [selectedCategory, detailSearch, detailStatusFilter]);

  const detailTotalPages = Math.ceil(filteredItems.length / DETAIL_PAGE_SIZE);
  const paginatedItems   = filteredItems.slice((detailPage - 1) * DETAIL_PAGE_SIZE, detailPage * DETAIL_PAGE_SIZE);

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assets Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track, manage and assign assets across your organization.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-foreground">
            <FolderPlus className="h-4 w-4" /> Import CSV
          </Button>
          <AddAssetModal
            allCategories={allCategories}
            onAddCategory={handleAddCategory}
            getNextId={getNextId}
            generatePrefix={generatePrefix}
            isOpen={isAddOpen}
            setIsOpen={setIsAddOpen}
          />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        <SummaryCard
          label="Total Assets"
          value={totalAssets}
          icon="💻"
        />
        <SummaryCard
          label="Assigned Assets"
          value={totalAssigned}
          icon="✅"
          iconClassName="bg-brand-success/10 text-brand-success"
          lineClassName="bg-brand-success"
        />
        <SummaryCard
          label="Dump Assets"
          value={totalDump}
          icon="🗑️"
          iconClassName="bg-brand-danger/10 text-brand-danger"
          lineClassName="bg-brand-danger"
        />
      </div>

      {/* ── Category Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allCategories.map(cat => (
          <AssetCategoryCard 
            key={cat.category}
            cat={cat}
            onSelect={(c) => {
              setSelectedCategory(c);
              setDetailSearch("");
              setDetailStatusFilter("All");
              setDetailPage(1);
            }}
          />
        ))}
      </div>

      {/* ── Category Detail Modal ── */}
      <Dialog open={!!selectedCategory} onOpenChange={open => { if (!open) { setSelectedCategory(null); setSelectedItem(null); } }}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col overflow-hidden">
          {selectedCategory && !selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedCategory.name} — Full Inventory</DialogTitle>
                <DialogDescription>
                  Total: {selectedCategory.items.length} · Assigned: {selectedCategory.items.filter(i => i.status === "Assigned").length} · Available: {selectedCategory.items.filter(i => i.status === "Available").length} · Dump/Repair: {selectedCategory.items.filter(i => i.status === "Dump" || i.status === "Repair").length}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 mt-2">
                <SearchInput
                  value={detailSearch}
                  onChange={(v) => { setDetailSearch(v); setDetailPage(1); }}
                  placeholder="Search ID, serial, assigned to..."
                  className="flex-1 h-9"
                  iconSize="sm"
                />
                <select value={detailStatusFilter}
                  onChange={e => { setDetailStatusFilter(e.target.value); setDetailPage(1); }}
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm focus:outline-none">
                  <option value="All">All</option>
                  <option>Assigned</option><option>Available</option><option>Dump</option><option>Repair</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
                {paginatedItems.length === 0
                  ? <div className="text-center py-10 text-muted-foreground text-sm">No items found.</div>
                  : paginatedItems.map(item => (
                    <button key={item.id}
                      className="w-full text-left flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
                      onClick={() => setSelectedItem(item)}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
                          {item.id.split("-")[1]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.id}</p>
                          <p className="text-xs text-muted-foreground font-mono">{item.serialNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.assignedTo && <p className="text-xs text-muted-foreground hidden sm:block">{item.assignedTo}</p>}
                        <StatusBadge status={item.status} size="sm" />
                        {item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date() && (
                          <Badge variant="secondary" className="text-xs bg-brand-warning/10 text-brand-warning border-0">Warranty ⚠</Badge>
                        )}
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))
                }
              </div>
              {detailTotalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t mt-2">
                  <p className="text-xs text-muted-foreground">{(detailPage - 1) * DETAIL_PAGE_SIZE + 1}–{Math.min(detailPage * DETAIL_PAGE_SIZE, filteredItems.length)} of {filteredItems.length}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setDetailPage(p => Math.max(1, p - 1))} disabled={detailPage === 1}><ChevronLeft className="h-3 w-3" /></Button>
                    {Array.from({ length: detailTotalPages }, (_, i) => i + 1).map(p => (
                      <Button key={p} size="sm" variant={p === detailPage ? "default" : "outline"}
                        onClick={() => setDetailPage(p)}
                        className={p === detailPage ? "bg-[var(--brand-primary)] text-white h-8 w-8 p-0" : "h-8 w-8 p-0"}>
                        {p}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setDetailPage(p => Math.min(detailTotalPages, p + 1))} disabled={detailPage === detailTotalPages}><ChevronRight className="h-3 w-3" /></Button>
                  </div>
                </div>
              )}
            </>
          )}

        </DialogContent>
      </Dialog>
      <AssetDetailModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
    </div>
  );
}
