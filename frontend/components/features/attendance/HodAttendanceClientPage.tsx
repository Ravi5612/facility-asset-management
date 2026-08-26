"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Upload, FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { attendanceService } from "@/services/attendance.service";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG } from "@/lib/constants";
import { useEffect } from "react";

export function HodAttendanceClientPage({ deptSlug }: { deptSlug: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; errors?: string[] } | null>(null);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }
  }, []);
  
  const deptName = user?.departmentName || deptSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["attendance", deptName, date],
    queryFn: () => attendanceService.getDepartmentAttendance(deptName, date),
    enabled: !!deptName,
  });

  const parseCSV = (text: string) => {
    const lines = text.split('\\n');
    if (lines.length < 2) return [];
    
    // Expect headers: EmployeeCode, Date, CheckIn, CheckOut, Status
    // Or at least try to find these indices
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const empIdx = headers.findIndex(h => h.includes('emp') || h.includes('code') || h.includes('id'));
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const inIdx = headers.findIndex(h => h.includes('in'));
    const outIdx = headers.findIndex(h => h.includes('out'));
    const statusIdx = headers.findIndex(h => h.includes('status'));

    if (empIdx === -1 || dateIdx === -1) {
      throw new Error("CSV must have at least Employee Code and Date columns");
    }

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < headers.length && cols.length < 2) continue;

      records.push({
        
        employeeCode: cols[empIdx],
        date: cols[dateIdx],
        checkIn: inIdx !== -1 ? cols[inIdx] || null : null,
        checkOut: outIdx !== -1 ? cols[outIdx] || null : null,
        status: statusIdx !== -1 ? cols[statusIdx] || 'PRESENT' : 'PRESENT',
      });
    }
    return records;
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const records = parseCSV(text);
      
      if (records.length === 0) {
        throw new Error("No valid records found in file");
      }

      const res = await attendanceService.bulkUpload(records);
      if (res.success) {
        setResult({
          success: true,
          message: `Successfully processed ${res.successCount} records. ${res.errorCount} failed.`,
          errors: res.errors
        });
        refetch();
      } else {
        throw new Error(res.message || "Upload failed");
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Failed to process file"
      });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const attendanceRecords = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and view daily attendance for {deptName}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-brand-primary" />
              Upload Attendance Sheet
            </CardTitle>
            <CardDescription>
              Upload a CSV file exported from the Secureye machine. Required columns: EmployeeCode, Date, CheckIn, CheckOut
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input 
                type="file" 
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? <Spinner size="sm" className="mr-2" /> : <FileUp className="h-4 w-4 mr-2" />}
                Upload
              </Button>
            </div>
            
            {result && (
              <div className={`flex gap-3 p-4 rounded-lg border ${result.success ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}>
                <div className="mt-0.5">
                  {result.success ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                </div>
                <div>
                  <h4 className="font-medium text-sm">
                    {result.success ? "Upload Complete" : "Upload Failed"}
                  </h4>
                  <div className="mt-1 text-sm opacity-90">
                    {result.message}
                    {result.errors && result.errors.length > 0 && (
                      <ul className="mt-2 list-disc pl-4 space-y-1 text-xs">
                        {result.errors.slice(0, 5).map((e: string, i: number) => <li key={i}>{e}</li>)}
                        {result.errors.length > 5 && <li>...and {result.errors.length - 5} more</li>}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Attendance Log</CardTitle>
            <CardDescription>View records for a specific date</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border rounded-lg bg-slate-50/50">
              No attendance records found for this date.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee Name</th>
                    <th className="px-4 py-3 font-medium">Emp Code</th>
                    <th className="px-4 py-3 font-medium">Check In</th>
                    <th className="px-4 py-3 font-medium">Check Out</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {attendanceRecords.map((record: any) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{record.employee?.user?.fullName || "N/A"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{record.employee?.employeeCode}</td>
                      <td className="px-4 py-3">
                        {record.checkIn ? format(new Date(record.checkIn), "hh:mm a") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {record.checkOut ? format(new Date(record.checkOut), "hh:mm a") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === "PRESENT" ? "bg-green-100 text-green-700" :
                          record.status === "ABSENT" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
