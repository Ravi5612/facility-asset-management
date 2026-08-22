import { Metadata } from "next";
import { TicketsClientPage } from "@/components/features/tickets/TicketsClientPage";

export const metadata: Metadata = {
  title: "My Tickets | DR IT GROUP",
};

export default function SubAdminTicketsPage() {
  return <TicketsClientPage />;
}
