const fs = require("fs");

const code = `
"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, Filter, Plus, Package, Layers, Users, ChevronRight, ArrowLeft } from "lucide-react";

export default function InventoryClientPage() {
  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return res.json();
    }
  });

  const [search, setSearch] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const floors = useMemo(() => {
    const floorMap = new Map();
    inventoryData.forEach(item => {
      const fl = item.floor || "Unknown Floor";
      const dept = item.department || "Unknown Department";
      if (!floorMap.has(fl)) floorMap.set(fl, new Set());
      floorMap.get(fl).add(dept);
    });
    return Array.from(floorMap.entries()).map(([floor, depts]) => ({
      name: floor,
      deptCount: depts.size
    }));
  }, [inventoryData]);

  const departments = useMemo(() => {
    if (!selectedFloor) return [];
    const deptMap = new Map();
    inventoryData
      .filter(item => (item.floor || "Unknown Floor") === selectedFloor)
      .forEach(item => {
        const dept = item.department || "Unknown Department";
        if (!deptMap.has(dept)) deptMap.set(dept, 0);
        deptMap.set(dept, deptMap.get(dept) + 1);
      });
    return Array.from(deptMap.entries()).map(([dept, count]) => ({
      name: dept,
      assetCount: count
    }));
  }, [inventoryData, selectedFloor]);

  const filteredData = useMemo(() => {
    let data = inventoryData;
    if (selectedFloor) {
      data = data.filter(i => (i.floor || "Unknown Floor") === selectedFloor);
    }
    if (selectedDepartment) {
      data = data.filter(i => (i.department || "Unknown Department") === selectedDepartment);
    }
    return data.filter((item: any) => 
      (item.hostname?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.ipAddress?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.seatNumber?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [inventoryData, selectedFloor, selectedDepartment, search]);

  return (
    <div className="absolute inset-0">
      <div className="h-full w-full flex flex-col overflow-hidden bg-card border rounded-xl shadow-sm">
        
        {/* Header Section */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium w-full sm:w-auto">
            <button 
              onClick={() => { setSelectedFloor(null); setSelectedDepartment(null); }}
              className={\`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors \${!selectedFloor ? "bg-white border shadow-sm" : "hover:bg-slate-100"}\`}
            >
              <Layers className="h-4 w-4 text-[var(--brand-primary)]" />
              Floors
            </button>
            {selectedFloor && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <button 
                  onClick={() => setSelectedDepartment(null)}
                  className={\`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors \${!selectedDepartment ? "bg-white border shadow-sm" : "hover:bg-slate-100"}\`}
                >
                  <Users className="h-4 w-4 text-purple-600" />
                  {selectedFloor}
                </button>
              </>
            )}
            {selectedDepartment && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 px-3 py-2 bg-white border shadow-sm rounded-lg">
                  <Package className="h-4 w-4 text-green-600" />
                  {selectedDepartment}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="overflow-auto flex-1 bg-slate-50/30">
          
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
          ) : !selectedFloor ? (
            /* Level 1: Floors Grid */
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-foreground">Select a Floor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {floors.map(f => (
                  <div 
                    key={f.name}
                    onClick={() => setSelectedFloor(f.name)}
                    className="bg-white dark:bg-slate-900 border rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-[var(--brand-primary)] rounded-lg group-hover:scale-110 transition-transform">
                        <Layers size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{f.name}</h3>
                        <p className="text-muted-foreground text-sm">{f.deptCount} Departments</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedFloor && !selectedDepartment ? (
            /* Level 2: Departments Grid */
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setSelectedFloor(null)} className="p-2 hover:bg-slate-200 rounded-full transition">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-foreground">Departments on {selectedFloor}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map(d => (
                  <div 
                    key={d.name}
                    onClick={() => setSelectedDepartment(d.name)}
                    className="bg-white dark:bg-slate-900 border rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                        <Users size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{d.name}</h3>
                        <p className="text-muted-foreground text-sm">{d.assetCount} Assets</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Level 3: Data Table */
            <table className="w-full text-sm text-left whitespace-nowrap bg-white dark:bg-slate-950">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-semibold shadow-sm">
                <tr>
                  <th className="px-4 py-3 sticky left-0 top-0 bg-slate-100 dark:bg-slate-800 z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">Seat No.</th>
                  <th className="px-4 py-3 sticky left-[80px] top-0 bg-slate-100 dark:bg-slate-800 z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">Hostname</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">IP Address</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">MAC Address</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">OS</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Make & Model</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Serial Number</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">RAM</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Processor</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Drive Config</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">BitLocker</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Symantec</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">No records found.</td>
                  </tr>
                ) : filteredData.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground sticky left-0 bg-white dark:bg-slate-950 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">{item.seatNumber || "- "}</td>
                    <td className="px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400 sticky left-[80px] bg-white dark:bg-slate-950 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">{item.hostname || "- "}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.ipAddress}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{item.macAddress || "- "}</td>
                    <td className="px-4 py-3">{item.os}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{item.make}</span>
                      <span className="text-muted-foreground block text-xs">{item.modelName}</span>
                    </td>
                    <td className="px-4 py-3 font-mono">{item.serialNumber}</td>
                    <td className="px-4 py-3">{item.ramGB || "0"}GB {item.ramType || ""}</td>
                    <td className="px-4 py-3 text-xs">{item.processor}</td>
                    <td className="px-4 py-3">{item.driveConfig}</td>
                    <td className="px-4 py-3 text-green-600 text-xs font-medium">{item.bitlocker}</td>
                    <td className="px-4 py-3 text-green-600 text-xs font-medium">{item.symantec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer */}
        {selectedFloor && selectedDepartment && (
          <div className="p-4 border-t bg-slate-50 flex items-center justify-between text-sm text-muted-foreground shrink-0">
            Showing {filteredData.length} records in {selectedDepartment}
          </div>
        )}
      </div>
    </div>
  );
}
\`;

fs.writeFileSync("components/features/hod/InventoryClientPage.tsx", code);

