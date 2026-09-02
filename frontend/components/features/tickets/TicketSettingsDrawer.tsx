"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "@/services/ticket.service";
import { Settings, X, Users, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TicketSettingsDrawer({ isOpen, onClose }: TicketSettingsDrawerProps) {
  const queryClient = useQueryClient();
  const [autoAssign, setAutoAssign] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["ticket-settings"],
    queryFn: ticketService.getTicketSettings,
    enabled: isOpen,
  });

  useEffect(() => {
    if (data?.settings) {
      setAutoAssign(data.settings.autoAssignEnabled ?? true);
      setSelectedStaff(data.settings.rotationStaffIds ?? []);
    }
  }, [data]);

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: () => ticketService.updateTicketSettings({
      autoAssignEnabled: autoAssign,
      rotationStaffIds: selectedStaff,
    }),
    onSuccess: () => {
      setSaveMsg("Settings saved!");
      queryClient.invalidateQueries({ queryKey: ["ticket-settings"] });
      setTimeout(() => setSaveMsg(null), 3000);
    },
    onError: () => setSaveMsg("Failed to save settings."),
  });

  const toggleStaff = (id: string) => {
    setSelectedStaff(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const employees: any[] = data?.employees || [];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-background border-l shadow-2xl flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10">
              <Settings className="h-5 w-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">Ticket Settings</h2>
              <p className="text-xs text-muted-foreground">Configure how tickets are handled in your department</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-10">Loading settings...</div>
          ) : (
            <>
              <div className="bg-card border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Auto-Assign Tickets</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      New incoming tickets will be automatically assigned to staff members (Round-Robin)
                    </p>
                  </div>
                  <button type="button" onClick={() => setAutoAssign(v => !v)} className="shrink-0 ml-4">
                    {autoAssign ? (
                      <ToggleRight className="h-8 w-8 text-[var(--brand-primary)]" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {autoAssign && (
                  <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-xs p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Tickets will be sequentially assigned to the selected staff members below.</span>
                  </div>
                )}
              </div>

              <div className="bg-card border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h3 className="font-semibold text-sm text-foreground">Staff Rotation List</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the staff members who should be included in the ticket rotation.
                </p>

                {employees.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No staff found in your department.</p>
                ) : (
                  <div className="space-y-2 mt-3">
                    {employees.map((emp: any) => {
                      const isSelected = selectedStaff.includes(emp.id);
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleStaff(emp.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                            isSelected
                              ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                              : "border-border bg-muted/20 text-muted-foreground hover:border-[var(--brand-primary)]/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? "bg-[var(--brand-primary)] text-white" : "bg-muted text-muted-foreground"
                            }`}>
                              {emp.firstName?.[0]?.toUpperCase()}{emp.lastName?.[0]?.toUpperCase()}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-foreground">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-muted-foreground">{emp.designation}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-[var(--brand-primary)]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedStaff.length > 0 && (
                  <div className="mt-2 text-xs text-[var(--brand-primary)] font-medium">
                    {selectedStaff.length} staff selected in rotation
                  </div>
                )}
              </div>

              {selectedStaff.length > 0 && (
                <div className="bg-muted/30 border rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rotation Order</h4>
                  <div className="space-y-1.5">
                    {selectedStaff.map((id, idx) => {
                      const emp = employees.find((e: any) => e.id === id);
                      return (
                        <div key={id} className="flex items-center gap-3 text-sm">
                          <span className="h-5 w-5 rounded-full bg-[var(--brand-primary)] text-white text-xs flex items-center justify-center font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-foreground">{emp?.firstName} {emp?.lastName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t px-6 py-4 bg-muted/20">
          {saveMsg && (
            <p className={`text-sm mb-3 font-medium ${saveMsg.startsWith("S") ? "text-green-600" : "text-red-500"}`}>
              {saveMsg}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={() => saveSettings()} disabled={isPending} className="flex-1 bg-[var(--brand-primary)] text-white hover:opacity-90">
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
