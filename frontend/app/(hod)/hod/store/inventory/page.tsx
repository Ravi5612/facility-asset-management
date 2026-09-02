"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { Download, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface InventoryLogItem {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  addedToStoreDate: string;
  purchaseDate: string;
  assignedToDept: string;
  assignedDate: string;
  status: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StoreInventoryPage() {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  const [from, setFrom] = useState(lastMonth.toISOString().split("T")[0]);
  const [to, setTo] = useState(today.toISOString().split("T")[0]);
  const [data, setData] = useState<InventoryLogItem[]>([]);
  const [filtered, setFiltered] = useState<InventoryLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (fromDate: string, toDate: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assets/inventory-log?from=${fromDate}&to=${toDate}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch inventory log");
      const json = await res.json();
      setData(json);
      setFiltered(json);
      setFetched(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(from, to);
  }, []);

  const handleApplyFilter = () => fetchData(from, to);

  const handleClearFilter = () => {
    const t = new Date();
    const lm = new Date();
    lm.setMonth(t.getMonth() - 1);
    const f = lm.toISOString().split("T")[0];
    const tStr = t.toISOString().split("T")[0];
    setFrom(f);
    setTo(tStr);
    fetchData(f, tStr);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    if (!val.trim()) {
      setFiltered(data);
    } else {
      const q = val.toLowerCase();
      setFiltered(data.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.assignedToDept?.toLowerCase().includes(q) ||
        item.id?.toLowerCase().includes(q)
      ));
    }
  };

  const downloadCSV = () => {
    const headers = ["Asset ID", "Name", "Category", "Serial No", "Added to Store", "Purchase Date", "Assigned To", "Assigned Date", "Status"];
    const rows = filtered.map(item => [
      item.id, item.name, item.category, item.serialNumber,
      formatDate(item.addedToStoreDate), formatDate(item.purchaseDate),
      item.assignedToDept, item.assignedToDept === "Store (In Stock)" ? "-" : formatDate(item.assignedDate),
      item.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `store-inventory-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Store Inventory Log</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track all assets added to store and their assignment history.</p>
        </div>
        {fetched && filtered.length > 0 && (
          <Button onClick={downloadCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">From Date</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">To Date</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <Button onClick={handleApplyFilter} disabled={isLoading} className="gap-2">
          <Filter className="h-4 w-4" />
          {isLoading ? "Loading..." : "Apply Filter"}
        </Button>
        <Button onClick={handleClearFilter} disabled={isLoading} variant="outline" className="gap-2">
          Reset to Last Month
        </Button>
        {fetched && (
          <div className="ml-auto flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, category, dept..." value={search} onChange={(e) => handleSearch(e.target.value)} className="w-60" />
          </div>
        )}
      </div>

      {isLoading && <PageLoader />}
      {error && <div className="text-center py-12 text-brand-danger">{error} <button onClick={handleApplyFilter} className="ml-2 underline text-sm">Retry</button></div>}

      {fetched && !isLoading && (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-secondary/30 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Serial No</th>
                  <th className="px-4 py-3 font-medium">Added to Store</th>
                  <th className="px-4 py-3 font-medium">Purchase Date</th>
                  <th className="px-4 py-3 font-medium">Assigned To</th>
                  <th className="px-4 py-3 font-medium">Assigned Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No records found.</td></tr>}
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono bg-secondary px-2 py-1 rounded text-xs">{item.id}</span></td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.serialNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.addedToStoreDate)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(item.purchaseDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={item.assignedToDept === "Store (In Stock)" ? "border-brand-success text-brand-success bg-brand-success/10" : "border-brand-warning text-brand-warning bg-brand-warning/10"}>
                        {item.assignedToDept}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.assignedToDept === "Store (In Stock)" ? "-" : formatDate(item.assignedDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={item.status === "AVAILABLE" ? "border-brand-success text-brand-success bg-brand-success/10" : "border-brand-warning text-brand-warning bg-brand-warning/10"}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
