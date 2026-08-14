import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SubAdmin } from "@/services/subAdmin.service";

export default function SubAdminTable({ data }: { data: SubAdmin[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-lg bg-card text-muted-foreground">
        No Sub Admins found.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-foreground">Name</TableHead>
            <TableHead className="font-semibold text-foreground">Email</TableHead>
            <TableHead className="font-semibold text-foreground">Departments</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((admin) => (
            <TableRow key={admin.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">{admin.name}</TableCell>
              <TableCell className="text-muted-foreground">{admin.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {admin.departments.map((dept) => (
                    <Badge key={dept} variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={admin.status === "Active" ? "default" : "destructive"}
                  className={
                    admin.status === "Active"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : ""
                  }
                >
                  {admin.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
