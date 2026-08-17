import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubAdmin } from "@/services/subAdmin.service";
import { Edit2, Trash2, MoreHorizontal, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubAdminTableProps {
  data: SubAdmin[];
  onEdit: (admin: SubAdmin) => void;
  onDelete: (id: string) => void;
  onSuspend?: (id: string) => void;
}

export default function SubAdminTable({ data, onEdit, onDelete, onSuspend }: SubAdminTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-lg bg-card text-muted-foreground">
        No Sub Admins found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-b">
            <TableHead className="font-semibold text-foreground">Name</TableHead>
            <TableHead className="font-semibold text-foreground">Email</TableHead>
            <TableHead className="font-semibold text-foreground">Departments</TableHead>
            <TableHead className="font-semibold text-foreground">Assigned Assets</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((admin) => (
            <TableRow key={admin.id} className="hover:bg-muted/30 border-b">
              <TableCell className="font-medium text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {admin.profileImage ? (
                      <img
                        src={admin.profileImage}
                        alt={admin.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">
                        {admin.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span>{admin.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{admin.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {admin.departments.map((dept) => (
                    <Badge
                      key={dept}
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      {dept}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-medium bg-muted/50">
                  {admin.assignedAssets || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={admin.status === "Active" ? "default" : "destructive"}
                  className={
                    admin.status === "Active"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }
                >
                  {admin.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(admin)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSuspend?.(admin.id)}>
                      <Ban className="mr-2 h-4 w-4" />
                      <span>Suspend</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(admin.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
