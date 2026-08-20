import { Metadata } from "next";
import HodDashboardClientPage from "@/components/features/hod/HodDashboardClientPage";

export const metadata: Metadata = {
  title: "HOD Dashboard | DR IT GROUP",
};

export default function HodDashboardPage() {
  return <HodDashboardClientPage />;
}
