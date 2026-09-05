"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, Filter, Plus, Package, Layers, Users, ChevronRight, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FLOOR_DEPARTMENTS: Record<string, string[]> = {
  "Basement": ["MMB", "Credit Mantri", "104", "College Process"],
  "Ground (0)": ["Traya", "Myntra HLCT", "Myntra M Now"],
  "1st Floor": ["Myntra Chat", "Muthoot Finance"],
  "2nd Floor": ["Myntra Email", "Myntra Voice", "AJIO"],
  "3rd Floor": ["Myntra IMVT", "Myntra Escalation Desk", "Myntra DOH"],
  "4th Floor": ["Flipkart Seller Support", "Shopcy MR", "Flipkart Seller"],
  "5th Floor": ["Flipkart ROH", "Paytm OCL", "PSPCL"],
  "6th Floor": ["Flipkart Jeeves"]
};

export default function InventoryClientPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const deptSegment = pathname.split('/')[2];
    const isStoreOrIT = deptSegment?.toLowerCase().includes('information-technology') || 
                        deptSegment?.toLowerCase() === 'it' ||
                        deptSegment?.toLowerCase().includes('store') ||
                        deptSegment?.toLowerCase().includes('inventory');
    if (!isStoreOrIT) {
      setIsAuthorized(false);
      router.push(`/hod/${deptSegment || 'general'}/dashboard`);
    }
  }, [pathname, router]);

  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return res.json();
    }
  });

  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const floors = useMemo(() => {
    const ALL_FLOORS = ["Basement", "Ground (0)", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor", "6th Floor"];
    const floorMap = new Map();
    
    // Initialize all standard floors with their default departments
    ALL_FLOORS.forEach(f => {
      floorMap.set(f, new Set(FLOOR_DEPARTMENTS[f] || []));
    });

    inventoryData.forEach((item: any) => {
      const fl = item.floor || "Unknown Floor";
      const dept = item.department || "Unknown Department";
      if (!floorMap.has(fl)) floorMap.set(fl, new Set());
      if (item.department) {
        floorMap.get(fl).add(dept);
      }
    });

    return Array.from(floorMap.entries()).map(([floor, depts]) => ({
      name: floor,
      deptCount: (depts as Set<string>).size
    }));
  }, [inventoryData]);



  const departments = useMemo(() => {
    if (!selectedFloor) return [];
    
    // Start with all hardcoded departments for this floor
    const expectedDepts = FLOOR_DEPARTMENTS[selectedFloor] || [];
    const deptMap = new Map<string, number>();
    expectedDepts.forEach(d => deptMap.set(d, 0));

    // Add dynamically found assets count
    inventoryData
      .filter((item: any) => (item.floor || "Unknown Floor") === selectedFloor)
      .forEach((item: any) => {
        const dept = item.department || "Unknown Department";
        if (!deptMap.has(dept)) deptMap.set(dept, 0);
        deptMap.set(dept, deptMap.get(dept)! + 1);
      });
      
    return Array.from(deptMap.entries()).map(([dept, count]) => ({
      name: dept,
      assetCount: count
    }));
  }, [inventoryData, selectedFloor]);

  const filteredData = useMemo(() => {
    let data = inventoryData;
    if (selectedFloor) {
      data = data.filter((i: any) => (i.floor || "Unknown Floor") === selectedFloor);
    }
    if (selectedDepartment) {
      data = data.filter((i: any) => (i.department || "Unknown Department") === selectedDepartment);
    }
    
    const filtered = data.filter((item: any) => 
      (item.hostname?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.ipAddress?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.seatNumber?.toLowerCase() || "").includes(search.toLowerCase())
    );

    // Natural sort by seatNumber (N-1, N-2, N-10, N-139, etc.)
    return filtered.sort((a: any, b: any) => {
      const seatA = a.seatNumber || "";
      const seatB = b.seatNumber || "";
      return seatA.localeCompare(seatB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [inventoryData, selectedFloor, selectedDepartment, search]);

  if (!isAuthorized) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
          <p className="text-muted-foreground">The Inventory page is restricted to the IT Department.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card border rounded-xl shadow-sm min-h-[calc(100vh-8rem)]">
        
        {/* Header Section */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            
            {/* Back Button */}
            {selectedFloor && (
              <button 
                onClick={() => {
                  if (selectedDepartment) setSelectedDepartment(null);
                  else setSelectedFloor(null);
                }}
                className="p-1.5 mr-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition text-muted-foreground hover:text-foreground"
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <button 
              onClick={() => { setSelectedFloor(null); setSelectedDepartment(null); }}
              className={"flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap " + (!selectedFloor ? "bg-white border shadow-sm" : "hover:bg-slate-100")}
            >
              <Layers className="h-4 w-4 text-[var(--brand-primary)]" />
              Floors
            </button>
            {selectedFloor && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <button 
                  onClick={() => setSelectedDepartment(null)}
                  className={"flex items-center gap-2 px-3 py-2 rounded-lg transition-colors " + (!selectedDepartment ? "bg-white border shadow-sm" : "hover:bg-slate-100")}
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
            <div className="p-6">
              <Skeleton className="h-7 w-40 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !selectedFloor ? (
            /* Level 1: Floors Grid */
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-foreground">Select a Floor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {floors.map(f => (
                  <div 
                    key={f.name}
                    onClick={() => setSelectedFloor(f.name)}
                    className="bg-white dark:bg-slate-900 border rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-brand-primary transition-all group"
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
                    className="bg-white dark:bg-slate-900 border rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-brand-primary transition-all group"
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
                  <th className="px-4 py-3 sticky left-[80px] top-0 bg-slate-100 dark:bg-slate-800 z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.1)] min-w-[320px]">System Info (CPU)</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">IP Address</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">BitLocker</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Symantec</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Monitor</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Keyboard</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Mouse</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Headset</th>
                  <th className="px-4 py-3 sticky top-0 bg-slate-100 dark:bg-slate-800 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Cables & Acc</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No records found.</td>
                  </tr>
                ) : filteredData.map((item: any, idx: number) => {
                    const isExpanded = expandedRows[item.id || idx];
                    const toggleRow = () => setExpandedRows(prev => ({ ...prev, [item.id || idx]: !prev[item.id || idx] }));
                    return (
                    <React.Fragment key={item.id || idx}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 font-bold text-foreground sticky left-0 bg-white dark:bg-slate-950 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">{item.seatNumber || "- "}</td>
                        <td className="px-4 py-3 sticky left-[80px] bg-white dark:bg-slate-950 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] min-w-[200px]">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={toggleRow}>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{item.hostname || "No Hostname"}</span>
                            <button className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-sm">{item.ipAddress || '-'}</td>
                        <td className="px-4 py-3 text-green-600 text-xs font-medium">{item.bitlocker}</td>
                        <td className="px-4 py-3 text-green-600 text-xs font-medium">{item.symantec}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.monitor ? (
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={toggleRow}>
                              <span className="font-medium group-hover:text-blue-600 transition-colors">{item.monitor}</span>
                              <button className="p-0.5 hover:bg-slate-100 rounded-full text-slate-500">
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.keyboard ? (
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={toggleRow}>
                              <span className="font-medium group-hover:text-blue-600 transition-colors">{item.keyboard}</span>
                              <button className="p-0.5 hover:bg-slate-100 rounded-full text-slate-500">
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.mouse ? (
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={toggleRow}>
                              <span className="font-medium group-hover:text-blue-600 transition-colors">{item.mouse}</span>
                              <button className="p-0.5 hover:bg-slate-100 rounded-full text-slate-500">
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.headset ? (
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={toggleRow}>
                              <span className="font-medium group-hover:text-blue-600 transition-colors">{item.headset}</span>
                              <button className="p-0.5 hover:bg-slate-100 rounded-full text-slate-500">
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.cables || item.accessories ? (
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={toggleRow}>
                              <span className="font-medium group-hover:text-blue-600 transition-colors">{(item.cables || "") + (item.accessories ? (item.cables ? ", " : "") + item.accessories : "")}</span>
                              <button className="p-0.5 hover:bg-slate-100 rounded-full text-slate-500">
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : "-"}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="px-4 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200">
                              <div className="bg-white dark:bg-slate-950 rounded-md border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-b border-slate-200">
                                    <tr>
                                      <th className="px-4 py-2 font-semibold">Component</th>
                                      <th className="px-4 py-2 font-semibold">Details / Name</th>
                                      <th className="px-4 py-2 font-semibold">Code / Model</th>
                                      <th className="px-4 py-2 font-semibold">Serial / Specs</th>
                                      <th className="px-4 py-2 font-semibold">Purchase & Warranty</th>
                                      <th className="px-4 py-2 font-semibold">Assignment Info</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {/* System & CPU */}
                                    <tr className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2 font-medium text-slate-700">🖥️ System & CPU</td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Host:</span> {item.hostname || 'N/A'}</div>
                                        <div><span className="text-slate-400">MAC:</span> {item.macAddress || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Code:</span> {item.assetCode || 'N/A'}</div>
                                        <div><span className="text-slate-400">Make:</span> {item.make || 'N/A'}</div>
                                        <div><span className="text-slate-400">Model:</span> {item.model || 'N/A'}</div>
                                        <div><span className="text-slate-400">Processor:</span> {item.processor || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">S/N:</span> {item.serialNumber || 'N/A'}</div>
                                        <div><span className="text-slate-400">RAM:</span> {item.ram ? `${item.ram}GB` : 'N/A'}</div>
                                        <div><span className="text-slate-400">Storage:</span> {item.hdd || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Purchased:</span> {item.purchaseDate || 'N/A'}</div>
                                        <div><span className="text-slate-400">Warranty Exp:</span> {item.warrantyExpiryDate || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        {item.cpuAssignInfo ? (
                                          <>
                                            <div><span className="text-slate-400">By:</span> {item.cpuAssignInfo.by}</div>
                                            <div><span className="text-slate-400">On:</span> {item.cpuAssignInfo.date}</div>
                                          </>
                                        ) : '-'}
                                      </td>
                                    </tr>
                                    {/* Security & Env */}
                                    <tr className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2 font-medium text-slate-700">🔒 Security & Env</td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">BitLocker:</span> {item.bitlocker || 'N/A'}</div>
                                        <div><span className="text-slate-400">Symantec:</span> {item.symantec || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Department:</span> {item.department || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Floor:</span> {item.floor || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">-</td>
                                      <td className="px-4 py-2 text-slate-600">-</td>
                                    </tr>
                                    {/* Peripherals */}
                                    {item.monitorDetails && <tr className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2 font-medium text-slate-700">🖵 Monitor</td>
                                      <td className="px-4 py-2 text-slate-600">{item.monitorDetails.name}</td>
                                      <td className="px-4 py-2 text-slate-600">{item.monitorDetails.code}</td>
                                      <td className="px-4 py-2 text-slate-600">{item.monitorDetails.serial}</td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Purchased:</span> {item.monitorDetails.purchaseDate || 'N/A'}</div>
                                        <div><span className="text-slate-400">Warranty:</span> {item.monitorDetails.warrantyExpiryDate || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        {item.monitorDetails.assignInfo ? (
                                          <>
                                            <div><span className="text-slate-400">By:</span> {item.monitorDetails.assignInfo.by}</div>
                                            <div><span className="text-slate-400">On:</span> {item.monitorDetails.assignInfo.date}</div>
                                          </>
                                        ) : '-'}
                                      </td>
                                    </tr>}
                                    {item.keyboardDetails && <tr className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2 font-medium text-slate-700">⌨️ Keyboard</td>
                                      <td className="px-4 py-2 text-slate-600">{item.keyboardDetails.name}</td>
                                      <td className="px-4 py-2 text-slate-600">{item.keyboardDetails.code}</td>
                                      <td className="px-4 py-2 text-slate-600">{item.keyboardDetails.serial}</td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Purchased:</span> {item.keyboardDetails.purchaseDate || 'N/A'}</div>
                                        <div><span className="text-slate-400">Warranty:</span> {item.keyboardDetails.warrantyExpiryDate || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        {item.keyboardDetails.assignInfo ? (
                                          <>
                                            <div><span className="text-slate-400">By:</span> {item.keyboardDetails.assignInfo.by}</div>
                                            <div><span className="text-slate-400">On:</span> {item.keyboardDetails.assignInfo.date}</div>
                                          </>
                                        ) : '-'}
                                      </td>
                                    </tr>}
                                    {item.mouseDetails && <tr className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2 font-medium text-slate-700">🖱️ Mouse</td>
                                      <td className="px-4 py-2 text-slate-600">{item.mouseDetails.name}</td>
                                      <td className="px-4 py-2 text-slate-600">{item.mouseDetails.code}</td>
                                      <td className="px-4 py-2 text-slate-600">{item.mouseDetails.serial}</td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Purchased:</span> {item.mouseDetails.purchaseDate || 'N/A'}</div>
                                        <div><span className="text-slate-400">Warranty:</span> {item.mouseDetails.warrantyExpiryDate || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        {item.mouseDetails.assignInfo ? (
                                          <>
                                            <div><span className="text-slate-400">By:</span> {item.mouseDetails.assignInfo.by}</div>
                                            <div><span className="text-slate-400">On:</span> {item.mouseDetails.assignInfo.date}</div>
                                          </>
                                        ) : '-'}
                                      </td>
                                    </tr>}
                                    {item.headsetDetails && <tr className="hover:bg-slate-50/50">
                                      <td className="px-4 py-2 font-medium text-slate-700">🎧 Headset</td>
                                      <td className="px-4 py-2 text-slate-600">{item.headsetDetails.name}</td>
                                      <td className="px-4 py-2 text-slate-600">{item.headsetDetails.code}</td>
                                      <td className="px-4 py-2 text-slate-600">{item.headsetDetails.serial}</td>
                                      <td className="px-4 py-2 text-slate-600">
                                        <div><span className="text-slate-400">Purchased:</span> {item.headsetDetails.purchaseDate || 'N/A'}</div>
                                        <div><span className="text-slate-400">Warranty:</span> {item.headsetDetails.warrantyExpiryDate || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-2 text-slate-600">
                                        {item.headsetDetails.assignInfo ? (
                                          <>
                                            <div><span className="text-slate-400">By:</span> {item.headsetDetails.assignInfo.by}</div>
                                            <div><span className="text-slate-400">On:</span> {item.headsetDetails.assignInfo.date}</div>
                                          </>
                                        ) : '-'}
                                      </td>
                                    </tr>}
                                  </tbody>
                                </table>
                              </div>
                            
                            {/* NEW SEAT HISTORY VIEW */}
                            <div className="mt-4 bg-white dark:bg-slate-950 p-4 rounded-md border border-slate-200 shadow-sm">
                              <SeatHistoryView seatNumber={item.seatNumber} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )})}
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
  );
}

function SeatHistoryView({ seatNumber }: { seatNumber: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  if (!seatNumber) return null;

  const loadHistory = async () => {
    if (show) {
      setShow(false);
      return;
    }
    try {
      setLoading(true);
      setShow(true);
      const res = await fetch(`/api/proxy/inventory/history?seatNumber=${seatNumber}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Hardware Change History</h4>
        <button 
          onClick={loadHistory}
          className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition-colors"
        >
          {show ? 'Hide History' : 'View History'}
        </button>
      </div>
      
      {show && (
        <div className="mt-3 overflow-x-auto">
          {loading ? (
            <div className="text-xs text-muted-foreground py-2">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2">No changes recorded for this seat yet.</div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 px-3 font-medium">Device</th>
                  <th className="py-2 px-3 font-medium">Code</th>
                  <th className="py-2 px-3 font-medium">Assigned</th>
                  <th className="py-2 px-3 font-medium">Returned</th>
                  <th className="py-2 px-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {h.assetName} <span className="text-[10px] text-slate-400 font-normal ml-1">({h.category})</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{h.assetCode}</td>
                    <td className="py-2 px-3 text-slate-500">
                      {new Date(h.assignedAt).toLocaleDateString()} {new Date(h.assignedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {h.returnedAt ? (
                        <>{new Date(h.returnedAt).toLocaleDateString()} {new Date(h.returnedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</>
                      ) : (
                        <span className="text-green-600 font-medium">Active</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-500 max-w-[200px] truncate" title={h.conditionOnReturn || '-'}>
                      {h.conditionOnReturn || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

