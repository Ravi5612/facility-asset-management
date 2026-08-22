"use client";
import { isPast } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, ChevronLeft, User } from "lucide-react";
import { AssetItem } from "@/types";

interface AssetDetailModalProps {
  selectedItem: AssetItem | null;
  setSelectedItem: (item: AssetItem | null) => void;
}

function getActionColor(action: string) {
  if (action === "Purchased") return "bg-brand-primary";
  if (action === "Assigned" || action === "Reassigned") return "bg-brand-success";
  if (action === "Returned") return "bg-brand-orange";
  if (action === "Dumped") return "bg-brand-danger";
  if (action === "Sent for Repair") return "bg-brand-warning";
  return "bg-gray-400";
}

export function AssetDetailModal({ selectedItem, setSelectedItem }: AssetDetailModalProps) {
  if (!selectedItem) return null;

  return (
    <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedItem(null)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-lg font-bold">{selectedItem.id}</DialogTitle>
              <DialogDescription className="font-mono text-xs">{selectedItem.serialNumber}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Status", content: <StatusBadge status={selectedItem.status} /> },
              { label: "Assigned To", content: <p className="font-semibold">{selectedItem.assignedTo ?? "Nobody"}</p> },
              { label: "Purchase Date", content: <p className="font-semibold">{selectedItem.purchaseDate}</p> },
              { label: "Warranty Expiry", content: <p className={`font-semibold ${selectedItem.warrantyExpiry && isPast(new Date(selectedItem.warrantyExpiry)) ? "text-brand-danger" : ""}`}>{selectedItem.warrantyExpiry ? `${selectedItem.warrantyExpiry}${isPast(new Date(selectedItem.warrantyExpiry)) ? " (Expired ⚠)" : " (Valid ✓)"}` : "No Warranty"}</p> },
              ...(selectedItem.assignedOn ? [{ label: "Assigned On", content: <p className="font-semibold">{selectedItem.assignedOn}</p> }] : []),
              ...(selectedItem.dumpedOn ? [{ label: "Dumped On", content: <p className="font-semibold text-brand-danger">{selectedItem.dumpedOn}</p> }] : []),
            ].map((field) => (
              <div key={field.label} className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                {field.content}
              </div>
            ))}
            {selectedItem.notes && (
              <div className="rounded-lg bg-brand-warning/10 p-3 col-span-2">
                <p className="text-xs text-brand-warning mb-1">Notes</p>
                <p className="font-semibold text-brand-warning">{selectedItem.notes}</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3">Full Activity History</h3>
            <div className="relative pl-5 space-y-3">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
              {selectedItem.history.map((h, i) => (
                <div key={`history-${h.date}-${i}`} className="relative flex gap-3">
                  <div className={`absolute -left-[13px] h-3 w-3 rounded-full border-2 border-background ${getActionColor(h.action)}`} />
                  <div className="flex-1 rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{h.action}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{h.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />{h.person}
                      {h.note && <span className="ml-2">— {h.note}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
