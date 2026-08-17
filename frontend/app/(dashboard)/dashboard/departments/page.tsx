"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, PlusCircle, Search, ChevronLeft, ChevronRight, Building2, Users, Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "@/components/ui/summary-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { mockDepartments, Department } from "./data";

const PAGE_SIZE = 6;

export default function DepartmentsPage() {
  const router = useRouter();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        setSuccess(false);
        setIsAddOpen(false);
      }, 2000);
    }, 1000);
  };

  const filtered = useMemo(() => {
    return mockDepartments.filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.hod.toLowerCase().includes(search.toLowerCase()) ||
                          d.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || d.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalDepts = mockDepartments.length;
  const activeDepts = mockDepartments.filter(d => d.status === "Active").length;
  const totalEmployees = mockDepartments.reduce((sum, d) => sum + d.employeeCount, 0);

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage company departments and their heads.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-lg bg-[var(--brand-primary)] text-sm font-semibold text-white hover:bg-[var(--brand-primary)]/90 hover:shadow-md">
              <PlusCircle className="h-4 w-4" /> Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Department</DialogTitle>
              <DialogDescription>Create a new department in the organization.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="deptName">Department Name *</Label>
                <Input id="deptName" required placeholder="e.g. Design Team" disabled={isLoading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hodName">HOD Name *</Label>
                  <Input id="hodName" required placeholder="e.g. John Doe" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hodEmail">HOD Email *</Label>
                  <Input id="hodEmail" type="email" required placeholder="john@company.com" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hodPassword">Password *</Label>
                  <Input id="hodPassword" type="password" required placeholder="••••••••" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hodConfirmPassword">Confirm Password *</Label>
                  <Input id="hodConfirmPassword" type="password" required placeholder="••••••••" disabled={isLoading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" rows={3} disabled={isLoading} placeholder="Brief description of the department's role..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">Department added successfully!</div>}
              <div className="pt-4 flex justify-end gap-3 border-t">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><PlusCircle className="mr-2 h-4 w-4" />Save Department</>}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SummaryCard
          label="Total Departments"
          value={totalDepts}
          icon={<Building2 className="h-6 w-6" />}
          iconClassName="bg-blue-100 text-blue-600"
          lineClassName="bg-blue-500"
        />
        <SummaryCard
          label="Active Departments"
          value={activeDepts}
          icon={<Building2 className="h-6 w-6" />}
          iconClassName="bg-green-100 text-green-600"
          lineClassName="bg-green-500"
        />
        <SummaryCard
          label="Total Employees"
          value={totalEmployees}
          icon={<Users className="h-6 w-6" />}
          iconClassName="bg-purple-100 text-purple-600"
          lineClassName="bg-purple-500"
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID or HOD..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9 w-full sm:max-w-[400px]" />
        </div>
        <select value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto">
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* ── Grid/Table ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {paginated.length === 0 ? (
           <div className="col-span-full text-center py-12 bg-card rounded-xl border text-muted-foreground">
             No departments found matching your search.
           </div>
        ) : (
          paginated.map((dept) => (
            <div key={dept.id} className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 relative overflow-hidden group">
               <div className="flex justify-between items-start pl-2">
                 <div>
                   <h3 className="font-bold text-foreground text-lg leading-tight">{dept.name}</h3>
                   <p className="text-xs text-muted-foreground font-mono mt-1">{dept.id}</p>
                 </div>
                 <Badge variant="secondary" className={dept.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                   {dept.status}
                 </Badge>
               </div>

               <p className="text-sm text-muted-foreground line-clamp-2 pl-2 flex-1">
                 {dept.description}
               </p>

               <div className="bg-muted/30 rounded-lg p-3 space-y-2 mt-2 ml-2">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">HOD</span>
                   <span className="font-semibold text-foreground">{dept.hod}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">Employees</span>
                   <div className="flex items-center gap-1.5 font-semibold text-foreground">
                     <Users className="h-3.5 w-3.5 text-muted-foreground" />
                     {dept.employeeCount}
                   </div>
                 </div>
               </div>

               <Button variant="outline" size="sm" 
                 className="w-full gap-2 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all"
                 onClick={() => router.push(`/dashboard/departments/${dept.id}`)}>
                 <Eye className="h-4 w-4" /> View Details
               </Button>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} departments
          </p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 w-9 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button key={p} size="sm" variant={p === currentPage ? "default" : "outline"}
                onClick={() => setCurrentPage(p)}
                className={`h-9 w-9 p-0 ${p === currentPage ? "bg-[var(--brand-primary)] text-white" : ""}`}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9 w-9 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
