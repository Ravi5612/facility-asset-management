import { Visitor } from "@/types";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, CheckCircle, XCircle, LogOut, LogIn } from "lucide-react";

interface VisitorTableProps {
  data: Visitor[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
}

export function VisitorTable({ data, onApprove, onReject, onCheckIn, onCheckOut }: VisitorTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-lg bg-card text-muted-foreground">
        No visitors found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((visitor) => (
        <div key={visitor.id} className="bg-card border rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          
          {/* Header: Status Badges */}
          <div className="p-4 border-b bg-muted/20 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-wrap gap-2">
                {visitor.approvalStatus === "Pending" && <Badge variant="outline" className="text-brand-warning border-brand-warning bg-brand-warning/10">Pending Approval</Badge>}
                {visitor.approvalStatus === "Approved" && <Badge variant="outline" className="text-brand-success border-brand-success bg-brand-success/10">Approved</Badge>}
                {visitor.approvalStatus === "Rejected" && <Badge variant="outline" className="text-brand-danger border-brand-danger bg-brand-danger/10">Rejected</Badge>}
                
                {visitor.approvalStatus === "Approved" && (
                  <>
                    {visitor.visitState === "Expected" && <Badge variant="secondary" className="bg-muted">Expected</Badge>}
                    {visitor.visitState === "Inside" && <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary">Inside</Badge>}
                    {visitor.visitState === "Checked Out" && <Badge variant="secondary" className="bg-brand-success/10 text-brand-success">Checked Out</Badge>}
                  </>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground">{visitor.id}</span>
            </div>

            {/* Time Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>{visitor.date}</span>
              {visitor.approvalStatus === "Approved" && (
                <div className="flex items-center gap-3">
                  {visitor.timeIn && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> In: {visitor.timeIn}</span>}
                  {visitor.timeOut && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Out: {visitor.timeOut}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Body: Visitor Details */}
          <div className="p-4 flex-1 flex flex-col">
            <div>
              <h3 className="font-bold text-lg text-foreground">{visitor.visitorName}</h3>
              <div className="text-sm text-muted-foreground flex flex-col mt-0.5">
                <span>{visitor.phone}</span>
                {visitor.visitorCompany && <span>{visitor.visitorCompany}</span>}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Purpose of Visit</p>
              <p className="text-sm text-foreground">{visitor.purpose}</p>
            </div>

            <div className="mt-auto pt-4">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Meeting With (Host)</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-foreground">{visitor.hostName}</span>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{visitor.hostEmpCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Actions */}
          <div className="p-4 border-t bg-muted/10 flex gap-2 justify-end">
            {visitor.approvalStatus === "Pending" && (
              <>
                <button 
                  onClick={() => onReject(visitor.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-brand-danger bg-brand-danger/10 hover:bg-brand-danger hover:text-white rounded-md transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
                <button 
                  onClick={() => onApprove(visitor.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-brand-success bg-brand-success/10 hover:bg-brand-success hover:text-white rounded-md transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </button>
              </>
            )}
            
            {visitor.approvalStatus === "Approved" && visitor.visitState === "Expected" && (
              <button 
                onClick={() => onCheckIn(visitor.id)}
                className="w-full justify-center px-3 py-2 text-sm font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 flex items-center gap-2 transition-colors shadow-sm"
              >
                <LogIn className="h-4 w-4" /> Check In Visitor
              </button>
            )}
            
            {visitor.approvalStatus === "Approved" && visitor.visitState === "Inside" && (
              <button 
                onClick={() => onCheckOut(visitor.id)}
                className="w-full justify-center px-3 py-2 text-sm font-semibold border-2 border-brand-primary text-brand-primary rounded-md hover:bg-brand-primary/5 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Check Out Visitor
              </button>
            )}

            {visitor.approvalStatus === "Rejected" && (
              <span className="text-xs font-medium text-muted-foreground w-full text-center py-1">
                Access Denied
              </span>
            )}
            
            {visitor.approvalStatus === "Approved" && visitor.visitState === "Checked Out" && (
              <span className="text-xs font-medium text-muted-foreground w-full text-center py-1 flex items-center justify-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-brand-success" /> Visit Completed
              </span>
            )}
          </div>
          
        </div>
      ))}
    </div>
  );
}
