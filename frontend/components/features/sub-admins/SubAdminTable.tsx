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
import { StatusBadge } from "@/components/ui/status-badge";
import { SubAdmin } from "@/types";
import { Edit2, Trash2, MoreHorizontal, Ban } from "lucide-react";
import Image from "next/image";
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
  onToggleStatus?: (id: string, currentStatus: "Active" | "Inactive") => void;
}

export default function SubAdminTable({ data, onEdit, onDelete, onToggleStatus }: SubAdminTableProps) {
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
            <TableRow key={admin.id} className="hover:bg-muted/50 transition-colors border-b">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-primary-light relative border">
                    {admin.profileImage ? (
                      <Image
                        src={admin.profileImage}
                        alt={admin.name}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <span className="text-xs font-bold text-brand-primary">
                        {admin.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{admin.name}</span>
                    <span className="text-[10px] font-medium text-brand-primary/80 bg-brand-primary-light/50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                      {admin.employeeCode || "N/A"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{admin.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {admin.departments.map((dept: string) => (
                    <Badge
                      key={dept}
                      variant="secondary"
                      className="text-xs bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20"
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
                <StatusBadge status={admin.status} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(admin)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus?.(admin.id, admin.status)}>
                      <Ban className="mr-2 h-4 w-4" />
                      <span>{admin.status === "Active" ? "Deactivate" : "Activate"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(admin.id)} className="text-brand-danger focus:text-brand-danger focus:bg-brand-danger/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                      <span>D</span>
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
