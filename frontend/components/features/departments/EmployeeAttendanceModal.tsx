"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, CalendarRange } from "lucide-react";
import { Employee } from "@/types";

interface EmployeeAttendanceModalProps {
  employee: Employee;
}

// Generate mock attendance based on percentage
function generateMockAttendance(attendancePercentage: number, empId: string) {
  const records = [];
  const today = new Date();
  
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;

  // Generate last 30 days
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
    // Randomize based on overall percentage
    const rand = Math.random() * 100;
    
    let status: "Present" | "Absent" | "Half-Day" | "Leave" = "Present";
    let checkIn = "09:00 AM";
    let checkOut = "06:00 PM";
    
    if (rand > attendancePercentage) {
      if (Math.random() > 0.5) {
        status = "Absent";
        checkIn = "--:--";
        checkOut = "--:--";
        absentCount++;
      } else {
        status = "Leave";
        checkIn = "--:--";
        checkOut = "--:--";
        leaveCount++;
      }
    } else {
      // If present, some might be late
      if (Math.random() > 0.85) {
        status = "Half-Day";
        checkIn = "09:15 AM";
        checkOut = "02:00 PM";
        lateCount++;
      } else if (Math.random() > 0.7) {
        checkIn = `09:${Math.floor(Math.random() * 45 + 10)} AM`;
        presentCount++;
      } else {
        presentCount++;
      }
    }

    records.push({
      id: `${empId}-att-${i}`,
      date: dateStr,
      status,
      checkIn,
      checkOut,
      dayName: d.toLocaleDateString("en-US", { weekday: "short" })
    });
  }
  
  return { records, summary: { presentCount, absentCount, lateCount, leaveCount } };
}

export function EmployeeAttendanceModal({ employee }: EmployeeAttendanceModalProps) {
  const [open, setOpen] = useState(false);
  const attendanceVal = parseInt(employee.attendance || "0");
  
  const { records, summary } = useMemo(() => generateMockAttendance(attendanceVal, employee.id), [attendanceVal, employee.id]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Present": return "text-brand-success bg-brand-success/10 border-brand-success/20";
      case "Absent": return "text-brand-danger bg-brand-danger/10 border-brand-danger/20";
      case "Half-Day": return "text-brand-warning bg-brand-warning/10 border-brand-warning/20";
      case "Leave": return "text-brand-info bg-brand-info/10 border-brand-info/20";
      default: return "text-muted-foreground bg-muted border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Present": return <CheckCircle2 className="h-3.5 w-3.5 text-brand-success" />;
      case "Absent": return <XCircle className="h-3.5 w-3.5 text-brand-danger" />;
      case "Half-Day": return <Clock className="h-3.5 w-3.5 text-brand-warning" />;
      case "Leave": return <AlertCircle className="h-3.5 w-3.5 text-brand-info" />;
      default: return null;
    }
  };

  const isGood = attendanceVal >= 95;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold transition-all hover:ring-2 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer ${
            isGood 
              ? "text-brand-success hover:bg-brand-success/10 focus:ring-brand-success" 
              : "text-brand-warning hover:bg-brand-warning/10 focus:ring-brand-warning"
          }`}>
            <CalendarDays className="h-3.5 w-3.5 opacity-70" />
            {employee.attendance || "N/A"}
          </button>
        }
      />
      
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Attendance Record
            <Badge variant="secondary" className={isGood ? "bg-brand-success/10 text-brand-success" : "bg-brand-warning/10 text-brand-warning"}>
              {employee.attendance} Overall
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Last 30 days attendance history for <strong>{employee.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mt-4 shrink-0">
          <div className="p-3 rounded-lg border bg-muted/20 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-brand-success">{summary.presentCount}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Present</span>
          </div>
          <div className="p-3 rounded-lg border bg-muted/20 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-brand-danger">{summary.absentCount}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Absent</span>
          </div>
          <div className="p-3 rounded-lg border bg-muted/20 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-brand-warning">{summary.lateCount}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Half-Day</span>
          </div>
          <div className="p-3 rounded-lg border bg-muted/20 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-brand-info">{summary.leaveCount}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Leave</span>
          </div>
        </div>

        {/* Attendance List */}
        <div className="overflow-y-auto mt-4 border rounded-xl overflow-hidden flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Check In</th>
                <th className="px-4 py-3 font-medium">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-muted-foreground/50" />
                      <div>
                        <p className="font-medium text-foreground">{record.date}</p>
                        <p className="text-xs text-muted-foreground">{record.dayName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {record.checkIn}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {record.checkOut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
