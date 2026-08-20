import { Metadata } from "next";
import HodEmployeesClientPage from "@/components/features/hod/HodEmployeesClientPage";

export const metadata: Metadata = {
  title: "Department Employees | DR IT GROUP",
};

export default function HodEmployeesPage() {
  return <HodEmployeesClientPage />;
}
