"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, PlusCircle, Laptop, Monitor, Mouse, Keyboard,
  Package, Eye, User, Calendar, Cable, Search, ChevronLeft, ChevronRight, FolderPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "@/components/ui/summary-card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";

/* ─── TYPES ─── */
type AssetItem = {
  id: string; serialNumber: string; purchaseDate: string;
  warrantyExpiry: string | null;
  status: "Assigned" | "Available" | "Dump" | "Repair";
  assignedTo: string | null; assignedOn: string | null;
  dumpedOn: string | null; repairedOn: string | null; notes: string;
  history: { action: string; person: string; date: string; note: string }[];
};

type AssetCategory = {
  category: string; name: string; prefix: string;
  isCustom?: boolean; items: AssetItem[];
};

/* ─── AUTO PREFIX GENERATOR ─── */
function generatePrefix(name: string): string {
  const words = name.trim().toUpperCase().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0] + (words[2]?.[0] ?? words[0][1] ?? "X")).slice(0, 3);
  return words[0].slice(0, 3).padEnd(3, "X");
}

/* ─── MOCK DATA ─── */
const people = ["Ravi Rai", "Amit Kumar", "Priya Singh", "Sita Sharma", "Rahul Verma", "Neha Gupta", "Vikas Joshi", "Pooja Mehra"];

function makeMice(): AssetItem[] {
  return Array.from({ length: 30 }, (_, i) => {
    const status: AssetItem["status"] = i < 20 ? "Assigned" : i < 27 ? "Available" : i < 29 ? "Dump" : "Repair";
    const person = people[i % people.length];
    return {
      id: `MSE-${String(i + 1).padStart(3, "0")}`, serialNumber: `MZ${1000 + i}`,
      purchaseDate: `2023-${String((i % 12) + 1).padStart(2, "0")}-15`,
      warrantyExpiry: i < 25 ? `2025-${String((i % 12) + 1).padStart(2, "0")}-15` : null,
      status, assignedTo: status === "Assigned" ? person : null,
      assignedOn: status === "Assigned" ? `2023-${String((i % 12) + 1).padStart(2, "0")}-20` : null,
      dumpedOn: status === "Dump" ? "2024-03-10" : null,
      repairedOn: status === "Repair" ? "2024-05-01" : null,
      notes: status === "Dump" ? "Scroll wheel broken" : status === "Repair" ? "Sensor repair" : "",
      history: [
        { action: "Purchased", person: "Admin", date: `2023-${String((i % 12) + 1).padStart(2, "0")}-15`, note: "Added to inventory" },
        ...(status === "Assigned" ? [{ action: "Assigned", person, date: `2023-${String((i % 12) + 1).padStart(2, "0")}-20`, note: `Assigned to ${person}` }] : []),
        ...(status === "Dump" ? [{ action: "Dumped", person: "Admin", date: "2024-03-10", note: "Scroll wheel broken, beyond repair" }] : []),
        ...(status === "Repair" ? [{ action: "Sent for Repair", person: "Rahul Verma", date: "2024-05-01", note: "Sensor issue" }] : []),
      ],
    };
  });
}

function makeKeyboards(): AssetItem[] {
  return Array.from({ length: 30 }, (_, i) => {
    const status: AssetItem["status"] = i < 18 ? "Assigned" : i < 28 ? "Available" : "Dump";
    const person = people[i % people.length];
    return {
      id: `KBD-${String(i + 1).padStart(3, "0")}`, serialNumber: `KB${2000 + i}`,
      purchaseDate: `2023-${String((i % 12) + 1).padStart(2, "0")}-10`,
      warrantyExpiry: i < 26 ? `2025-${String((i % 12) + 1).padStart(2, "0")}-10` : null,
      status, assignedTo: status === "Assigned" ? person : null,
      assignedOn: status === "Assigned" ? `2023-${String((i % 12) + 1).padStart(2, "0")}-12` : null,
      dumpedOn: status === "Dump" ? "2024-04-20" : null,
      repairedOn: null, notes: status === "Dump" ? "Keys not working" : "",
      history: [
        { action: "Purchased", person: "Admin", date: `2023-${String((i % 12) + 1).padStart(2, "0")}-10`, note: "Added to inventory" },
        ...(status === "Assigned" ? [{ action: "Assigned", person, date: `2023-${String((i % 12) + 1).padStart(2, "0")}-12`, note: `Assigned to ${person}` }] : []),
        ...(status === "Dump" ? [{ action: "Dumped", person: "Admin", date: "2024-04-20", note: "Multiple keys non-functional" }] : []),
      ],
    };
  });
}

const staticData: AssetCategory[] = [
  {
    category: "Laptop", name: "Laptops", prefix: "LAP",
    items: [
      { id: "LAP-001", serialNumber: "C02X98712", purchaseDate: "2024-01-15", warrantyExpiry: "2027-01-15", status: "Assigned", assignedTo: "Ravi Rai", assignedOn: "2024-06-02", dumpedOn: null, repairedOn: null, notes: "", history: [{ action: "Purchased", person: "Admin", date: "2024-01-15", note: "" }, { action: "Assigned", person: "Amit Kumar", date: "2024-01-16", note: "" }, { action: "Reassigned", person: "Ravi Rai", date: "2024-06-02", note: "Transferred" }] },
      { id: "LAP-002", serialNumber: "PF3B12XY", purchaseDate: "2021-06-01", warrantyExpiry: null, status: "Dump", assignedTo: null, assignedOn: null, dumpedOn: "2024-01-10", repairedOn: null, notes: "Motherboard failed", history: [{ action: "Purchased", person: "Admin", date: "2021-06-01", note: "" }, { action: "Assigned", person: "Sita Sharma", date: "2021-06-02", note: "" }, { action: "Dumped", person: "Admin", date: "2024-01-10", note: "Motherboard failure" }] },
      { id: "LAP-003", serialNumber: "C02Y44821", purchaseDate: "2024-03-01", warrantyExpiry: "2027-03-01", status: "Assigned", assignedTo: "Priya Singh", assignedOn: "2024-03-02", dumpedOn: null, repairedOn: null, notes: "", history: [{ action: "Purchased", person: "Admin", date: "2024-03-01", note: "" }, { action: "Assigned", person: "Priya Singh", date: "2024-03-02", note: "" }] },
    ],
  },
  {
    category: "Monitor", name: "Monitors", prefix: "MON",
    items: [
      { id: "MON-001", serialNumber: "CN-0XX123", purchaseDate: "2023-11-20", warrantyExpiry: "2026-11-20", status: "Available", assignedTo: null, assignedOn: null, dumpedOn: null, repairedOn: null, notes: "", history: [{ action: "Purchased", person: "Admin", date: "2023-11-20", note: "" }, { action: "Returned", person: "Priya Singh", date: "2024-05-30", note: "Employee left" }] },
      { id: "MON-002", serialNumber: "34WN80C", purchaseDate: "2024-02-28", warrantyExpiry: "2027-02-28", status: "Assigned", assignedTo: "Sita Sharma", assignedOn: "2024-03-01", dumpedOn: null, repairedOn: null, notes: "", history: [{ action: "Purchased", person: "Admin", date: "2024-02-28", note: "" }, { action: "Assigned", person: "Sita Sharma", date: "2024-03-01", note: "" }] },
    ],
  },
  { category: "Mouse", name: "Mouse", prefix: "MSE", items: makeMice() },
  { category: "Keyboard", name: "Keyboards", prefix: "KBD", items: makeKeyboards() },
  {
    category: "Cable", name: "Cables (VGA / HDMI)", prefix: "CBL",
    items: [
      { id: "CBL-001", serialNumber: "VGA-1001", purchaseDate: "2022-04-10", warrantyExpiry: null, status: "Available", assignedTo: null, assignedOn: null, dumpedOn: null, repairedOn: null, notes: "VGA 1.5m", history: [{ action: "Purchased", person: "Admin", date: "2022-04-10", note: "" }, { action: "Returned", person: "Amit Kumar", date: "2023-08-20", note: "" }] },
      { id: "CBL-002", serialNumber: "VGA-1002", purchaseDate: "2022-05-15", warrantyExpiry: null, status: "Assigned", assignedTo: "Neha Gupta", assignedOn: "2022-05-16", dumpedOn: null, repairedOn: null, notes: "VGA 3m", history: [{ action: "Purchased", person: "Admin", date: "2022-05-15", note: "" }, { action: "Assigned", person: "Neha Gupta", date: "2022-05-16", note: "" }] },
      { id: "CBL-003", serialNumber: "HDM-2001", purchaseDate: "2023-03-01", warrantyExpiry: null, status: "Available", assignedTo: null, assignedOn: null, dumpedOn: null, repairedOn: null, notes: "HDMI 2m", history: [{ action: "Purchased", person: "Admin", date: "2023-03-01", note: "" }] },
      { id: "CBL-004", serialNumber: "HDM-2002", purchaseDate: "2023-06-20", warrantyExpiry: null, status: "Dump", assignedTo: null, assignedOn: null, dumpedOn: "2023-01-05", repairedOn: null, notes: "HDMI - connector broken", history: [{ action: "Purchased", person: "Admin", date: "2023-06-20", note: "" }, { action: "Dumped", person: "Admin", date: "2023-01-05", note: "Connector broken" }] },
    ],
  },
];

function getCategoryIcon(category: string) {
  if (category === "Laptop") return Laptop;
  if (category === "Monitor") return Monitor;
  if (category === "Mouse") return Mouse;
  if (category === "Keyboard") return Keyboard;
  if (category === "Cable") return Cable;
  return Package;
}

function getStatusStyle(status: string) {
  if (status === "Available") return "bg-green-100 text-green-700";
  if (status === "Assigned") return "bg-blue-100 text-blue-700";
  if (status === "Repair") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function getActionColor(action: string) {
  if (action === "Purchased") return "bg-blue-500";
  if (action === "Assigned" || action === "Reassigned") return "bg-green-500";
  if (action === "Returned") return "bg-orange-500";
  if (action === "Dumped") return "bg-red-500";
  if (action === "Sent for Repair") return "bg-yellow-500";
  return "bg-gray-400";
}

const DETAIL_PAGE_SIZE = 8;

/* ═══════════════════════════════════════════ */
export default function AssetsPage() {
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
    ...staticData,
    ...customCategories,
  ], [customCategories]);

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
    }, 1000);
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
        <div className="flex gap-2 shrink-0">
          {/* Add Asset */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-lg bg-[var(--brand-primary)] text-sm font-semibold text-white hover:bg-[var(--brand-primary)]/90 hover:shadow-md">
                <PlusCircle className="h-4 w-4" /> Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Asset</DialogTitle>
                <DialogDescription className="text-base mt-1">ID will be auto-generated based on category.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="assetName">Asset Name *</Label>
                    <Input id="assetName" required placeholder="e.g. MacBook Pro M3" disabled={isLoading} />
                  </div>

                  {/* Category dropdown with inline + Add Category dialog */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <div className="flex gap-2">
                      <select id="category" required disabled={isLoading}
                        value={selectedFormCat}
                        onChange={e => setSelectedFormCat(e.target.value)}
                        className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select Category</option>
                        {allCategories.map(c => (
                          <option key={c.category} value={c.category}>{c.name}{c.isCustom ? " ✦" : ""}</option>
                        ))}
                      </select>
                      <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm"
                            className="shrink-0 px-2 gap-1 text-xs"
                            title="Add new category">
                            <FolderPlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[420px]">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Add New Category</DialogTitle>
                            <DialogDescription>Create a new asset category. ID prefix will be auto-generated.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label>Category Name *</Label>
                              <Input placeholder="e.g. Projector, UPS, Printer"
                                value={newCatName}
                                onChange={e => { setNewCatName(e.target.value); setNewCatPrefix(generatePrefix(e.target.value)); }} />
                            </div>
                            <div className="space-y-2">
                              <Label>ID Prefix <span className="text-muted-foreground text-xs">(auto-generated, editable)</span></Label>
                              <div className="flex gap-2 items-center">
                                <Input className="font-mono uppercase w-24" maxLength={3} placeholder="PRJ"
                                  value={newCatPrefix}
                                  onChange={e => setNewCatPrefix(e.target.value.toUpperCase().slice(0, 3))} />
                                <p className="text-xs text-muted-foreground">
                                  → <span className="font-mono font-semibold">{(newCatPrefix || generatePrefix(newCatName || "XXX"))}-001</span>, <span className="font-mono font-semibold">{(newCatPrefix || generatePrefix(newCatName || "XXX"))}-002</span>…
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t">
                              <Button variant="ghost" type="button" onClick={() => { setIsAddCatOpen(false); setNewCatName(""); setNewCatPrefix(""); }}>Cancel</Button>
                              <Button type="button" onClick={handleAddCategory} disabled={!newCatName.trim()} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
                                <FolderPlus className="mr-2 h-4 w-4" /> Create Category
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Auto ID Preview */}
                  {selectedFormCat && (
                    <div className="space-y-2 col-span-2">
                      <Label>Auto-Generated Asset ID</Label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted border border-dashed">
                        <span className="font-mono font-bold text-[var(--brand-primary)] text-base">{getNextId(selectedFormCat)}</span>
                        <span className="text-xs text-muted-foreground">— This ID will be assigned automatically</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input id="serialNumber" required placeholder="e.g. C02X..." disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input id="purchaseDate" type="date" disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                    <Input id="warrantyExpiry" type="date" disabled={isLoading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea id="notes" rows={3} disabled={isLoading} placeholder="Any notes..."
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">Asset added successfully!</div>}
                <div className="pt-4 flex justify-end gap-3 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} disabled={isLoading}>Cancel</Button>
                  <Button type="submit" disabled={isLoading} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : <><PlusCircle className="mr-2 h-4 w-4" />Save Asset</>}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        <SummaryCard
          label="Total Assets"
          value={totalAssets}
          icon="💻"
          iconClassName="bg-blue-100 text-blue-600"
          lineClassName="bg-blue-500"
        />
        <SummaryCard
          label="Assigned Assets"
          value={totalAssigned}
          icon="✅"
          iconClassName="bg-green-100 text-green-600"
          lineClassName="bg-green-500"
        />
        <SummaryCard
          label="Dump Assets"
          value={totalDump}
          icon="🗑️"
          iconClassName="bg-red-100 text-red-600"
          lineClassName="bg-red-500"
        />
      </div>

      {/* ── Category Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allCategories.map(cat => {
          const Icon = getCategoryIcon(cat.category);
          const total    = cat.items.length;
          const assigned = cat.items.filter(i => i.status === "Assigned").length;
          const available= cat.items.filter(i => i.status === "Available").length;
          const bad      = cat.items.filter(i => i.status === "Dump" || i.status === "Repair").length;
          return (
            <div key={cat.category} className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base truncate">{cat.name}</h3>
                    {cat.isCustom && <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700 shrink-0">Custom</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">Prefix: <span className="font-mono font-semibold">{cat.prefix}</span> · {total} units</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Total",     value: total,     bg: "bg-blue-50",  text: "text-blue-700",  sub: "text-blue-400" },
                  { label: "Assigned",  value: assigned,  bg: "bg-green-50", text: "text-green-700", sub: "text-green-400" },
                  { label: "Available", value: available, bg: "bg-slate-50", text: "text-slate-700", sub: "text-slate-400" },
                  { label: "Dump/Rep",  value: bad,       bg: "bg-red-50",   text: "text-red-700",   sub: "text-red-400" },
                ].map(s => (
                  <div key={s.label} className={`rounded-lg ${s.bg} py-2`}>
                    <p className={`text-lg font-extrabold ${s.text}`}>{s.value}</p>
                    <p className={`text-[10px] font-medium ${s.sub} mt-0.5`}>{s.label}</p>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm"
                className="w-full gap-2 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all"
                onClick={() => { setSelectedCategory(cat); setDetailSearch(""); setDetailStatusFilter("All"); setDetailPage(1); }}>
                <Eye className="h-4 w-4" /> View All {cat.name}
              </Button>
            </div>
          );
        })}
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search ID, serial, assigned to..." value={detailSearch}
                    onChange={e => { setDetailSearch(e.target.value); setDetailPage(1); }}
                    className="pl-8 h-9 text-sm" />
                </div>
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
                    <div key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => setSelectedItem(item)}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                          {item.id.split("-")[1]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.id}</p>
                          <p className="text-xs text-muted-foreground font-mono">{item.serialNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.assignedTo && <p className="text-xs text-muted-foreground hidden sm:block">{item.assignedTo}</p>}
                        <Badge variant="secondary" className={`text-xs ${getStatusStyle(item.status)}`}>{item.status}</Badge>
                        {item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date() && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Warranty ⚠</Badge>
                        )}
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
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

          {/* ── Individual Item Detail ── */}
          {selectedCategory && selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedItem(null)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle className="text-lg font-bold">{selectedItem.id}</DialogTitle>
                    <DialogDescription className="font-mono text-xs">{selectedItem.serialNumber}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="overflow-y-auto space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Status", content: <Badge variant="secondary" className={getStatusStyle(selectedItem.status)}>{selectedItem.status}</Badge> },
                    { label: "Assigned To", content: <p className="font-semibold">{selectedItem.assignedTo ?? "Nobody"}</p> },
                    { label: "Purchase Date", content: <p className="font-semibold">{selectedItem.purchaseDate}</p> },
                    { label: "Warranty Expiry", content: <p className={`font-semibold ${selectedItem.warrantyExpiry && new Date(selectedItem.warrantyExpiry) < new Date() ? "text-red-600" : ""}`}>{selectedItem.warrantyExpiry ? `${selectedItem.warrantyExpiry}${new Date(selectedItem.warrantyExpiry) < new Date() ? " (Expired ⚠)" : " (Valid ✓)"}` : "No Warranty"}</p> },
                    ...(selectedItem.assignedOn ? [{ label: "Assigned On", content: <p className="font-semibold">{selectedItem.assignedOn}</p> }] : []),
                    ...(selectedItem.dumpedOn ? [{ label: "Dumped On", content: <p className="font-semibold text-red-600">{selectedItem.dumpedOn}</p> }] : []),
                  ].map((field, i) => (
                    <div key={i} className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                      {field.content}
                    </div>
                  ))}
                  {selectedItem.notes && (
                    <div className="rounded-lg bg-orange-50 p-3 col-span-2">
                      <p className="text-xs text-orange-400 mb-1">Notes</p>
                      <p className="font-semibold text-orange-700">{selectedItem.notes}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-3">Full Activity History</h3>
                  <div className="relative pl-5 space-y-3">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                    {selectedItem.history.map((h, i) => (
                      <div key={i} className="relative flex gap-3">
                        <div className={`absolute -left-[13px] h-3 w-3 rounded-full border-2 border-background ${getActionColor(h.action)}`} />
                        <div className="flex-1 rounded-lg border bg-muted/20 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold">{h.action}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{h.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />{h.person}
                            {h.note && <span className="ml-2">— {h.note}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
