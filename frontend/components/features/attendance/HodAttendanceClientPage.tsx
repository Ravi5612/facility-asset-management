"use client";

import { useEffect, useState } from "react";
import { AttendanceManager } from "./AttendanceManager";

export function HodAttendanceClientPage({ deptSlug }: { deptSlug: string }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }
  }, []);
  const deptName = user?.departmentName || (deptSlug ? deptSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Department");

  return <AttendanceManager deptName={deptName} />;
}

