import { visitorService } from "@/services/visitor.service";
import { VisitorsClientPage } from "@/components/features/visitors/VisitorsClientPage";

export default async function VisitorsPage() {
  const visitors = await visitorService.getVisitors();
  return <VisitorsClientPage initialVisitors={visitors} />;
}
