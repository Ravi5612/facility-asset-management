"use client";

import { useState } from "react";
import { Visitor } from "@/types";
import { visitorService } from "@/services/visitor.service";
import { VisitorTable } from "./VisitorTable";
import { SearchInput } from "@/components/ui/search-input";
import { ErrorAlert } from "@/components/ui/alert-box";

interface VisitorsClientPageProps {
  initialVisitors: Visitor[];
}

export function VisitorsClientPage({ initialVisitors }: VisitorsClientPageProps) {
  const [data, setData] = useState<Visitor[]>(initialVisitors);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");

  const handleAction = async (id: string, action: "Approve" | "Reject" | "CheckIn" | "CheckOut") => {
    try {
      setError(null);
      const updatedVisitor = await visitorService.updateVisitorStatus(id, action);
      setData((prev) => prev.map((v) => (v.id === id ? updatedVisitor : v)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${action.toLowerCase()} visitor`;
      setError(errorMessage);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFilter("All");
    setCustomDate("");
    setApprovalFilter("All");
    setStateFilter("All");
  };

  // Filter Data
  const filteredData = data.filter((visitor) => {
    const matchSearch =
      visitor.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchApproval = approvalFilter === "All" || visitor.approvalStatus === approvalFilter;
    const matchState = stateFilter === "All" || visitor.visitState === stateFilter;

    let matchDate = true;
    if (dateFilter !== "All") {
      const visitDateObj = new Date(visitor.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "Today") {
        const todayStr = today.toISOString().split("T")[0];
        matchDate = visitor.date === todayStr;
      } else if (dateFilter === "Yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        matchDate = visitor.date === yesterdayStr;
      } else if (dateFilter === "Custom" && customDate) {
        matchDate = visitor.date === customDate;
      }
    }

    return matchSearch && matchApproval && matchState && matchDate;
  });

  const hasFilters = searchQuery !== "" || dateFilter !== "All" || approvalFilter !== "All" || stateFilter !== "All";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visitors</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Log and manage company visitors, approvals, and check-ins.
          </p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="p-4 border rounded-lg bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchInput 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search visitors, hosts, purpose..." 
          className="flex-1 max-w-[300px]"
        />
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter */}
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none cursor-pointer">
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Custom">Custom Date</option>
          </select>
          
          {dateFilter === "Custom" && (
            <input 
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 border border-input rounded-md bg-background text-sm focus:outline-none cursor-pointer"
            />
          )}

          {/* Approval Filter */}
          <select value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none cursor-pointer">
            <option value="All">All Approvals</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* State Filter */}
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none cursor-pointer">
            <option value="All">All States</option>
            <option value="Not Arrived">Not Arrived</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
          </select>

          {/* Clear Button */}
          {hasFilters && (
            <button 
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted px-3 h-9 rounded-md text-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="border rounded-lg bg-card shadow-sm">
        <VisitorTable 
          data={filteredData} 
          onApprove={(id) => handleAction(id, "Approve")}
          onReject={(id) => handleAction(id, "Reject")}
          onCheckIn={(id) => handleAction(id, "CheckIn")}
          onCheckOut={(id) => handleAction(id, "CheckOut")}
        />
      </div>
    </div>
  );
}
