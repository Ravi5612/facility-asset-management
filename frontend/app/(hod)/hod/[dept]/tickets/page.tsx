import { Metadata } from "next";
import { TicketsClientPage } from "@/components/features/tickets/TicketsClientPage";

export const metadata: Metadata = {
  title: "Department Tickets | DR IT GROUP",
};

export default function HodTicketsPage() {
  return <TicketsClientPage />;
}
