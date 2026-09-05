"use client";

import { useEffect, useState } from "react";
import { AttendanceManager } from "./AttendanceManager";
import { attendanceService } from "@/services/attendance.service";
import { useAuth } from "@/components/providers/AuthProvider";

export function HodAttendanceClientPage({ deptSlug }: { deptSlug: string }) {
  const { user } = useAuth();
  const deptName = user?.departmentName || (deptSlug ? deptSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Department");

  return <AttendanceManager deptName={deptName} />;
}

