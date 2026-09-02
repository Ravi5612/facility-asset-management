import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetCategory } from "@/types";
import { Laptop, Monitor, Mouse, Keyboard, Package, Cable, Eye } from "lucide-react";

function getCategoryIcon(category: string) {
  if (category === "Laptop") return Laptop;
  if (category === "Monitor") return Monitor;
  if (category === "Mouse") return Mouse;
  if (category === "Keyboard") return Keyboard;
  if (category === "Cable") return Cable;
  return Package;
}

interface AssetCategoryCardProps {
  cat: AssetCategory;
  onSelect: (cat: AssetCategory) => void;
  isStockView?: boolean;
}

export function AssetCategoryCard({ cat, onSelect, isStockView }: AssetCategoryCardProps) {
  const Icon = getCategoryIcon(cat.category);
  const total = cat.items.length;
  
  const isStoreAsset = (a: any) => !a.departmentName || a.departmentName.toLowerCase().includes('store') || a.departmentName.toLowerCase().includes('inventory');

  let assigned = 0;
  let available = 0;
  let bad = 0;

  if (isStockView) {
    assigned = cat.items.filter((i: any) => !isStoreAsset(i) && i.status !== "Repair" && i.status !== "IN_MAINTENANCE" && i.status !== "Dump" && i.status !== "RETIRED" && i.status !== "Returned").length;
    available = cat.items.filter((i: any) => isStoreAsset(i) && (i.status === "Available" || i.status === "AVAILABLE")).length;
    bad = cat.items.filter((i: any) => i.status === "Dump" || i.status === "Repair" || i.status === "IN_MAINTENANCE" || i.status === "RETIRED" || i.status === "Returned").length;
  } else {
    assigned = cat.items.filter((i: any) => i.status === "Assigned" || i.status === "ASSIGNED").length;
    available = cat.items.filter((i: any) => i.status === "Available" || i.status === "AVAILABLE").length;
    bad = cat.items.filter((i: any) => i.status === "Dump" || i.status === "Repair" || i.status === "IN_MAINTENANCE" || i.status === "RETIRED" || i.status === "Returned").length;
  }
  let cardBorderClass = "border-border hover:border-brand-primary";
  let stockBoxBg = "bg-muted/50";
  let stockBoxText = "text-foreground";
  let stockBoxSub = "text-muted-foreground";

  if (isStockView && total > 0) {
    if (available === 0 || available <= 0.20 * assigned) {
      cardBorderClass = "border-red-400 bg-red-50/40 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.1)]";
      stockBoxBg = "bg-red-600 animate-pulse border border-red-700 shadow-[0_0_10px_rgba(220,38,38,0.5)]";
      stockBoxText = "text-white";
      stockBoxSub = "text-white/90";
    } else if (available <= 0.50 * assigned) {
      cardBorderClass = "border-orange-300 bg-orange-50/40 hover:border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]";
      stockBoxBg = "bg-orange-500 border border-orange-600 shadow-[0_0_8px_rgba(249,115,22,0.4)]";
      stockBoxText = "text-white";
      stockBoxSub = "text-white/90";
    } else {
      cardBorderClass = "border-green-300 bg-green-50/40 hover:border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
      stockBoxBg = "bg-green-500 border border-green-600 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
      stockBoxText = "text-white";
      stockBoxSub = "text-white/90";
    }
  }

  return (
    <div className={`bg-card border-2 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col gap-4 ${cardBorderClass}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/20 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-base truncate">{cat.name}</h3>
            {cat.isCustom && <Badge variant="secondary" className="text-[10px] bg-brand-info/10 text-brand-info shrink-0">Custom</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">Prefix: <span className="font-mono font-semibold">{cat.prefix}</span> · {total} units</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Total", value: total, bg: "bg-brand-primary/10", text: "text-brand-primary", sub: "text-brand-primary/70" },
          { label: "Assigned", value: assigned, bg: "bg-brand-success/10", text: "text-brand-success", sub: "text-brand-success/70" },
          { 
            label: isStockView ? "Stock" : "Available", 
            value: available, 
            bg: stockBoxBg, 
            text: stockBoxText, 
            sub: stockBoxSub 
          },
          { label: "Returned", value: bad, bg: "bg-brand-danger/10", text: "text-brand-danger", sub: "text-brand-danger/70" },
        ].map(s => (
          <div key={s.label} className={`rounded-lg ${s.bg} py-2`}>
            <p className={`text-lg font-extrabold ${s.text}`}>{s.value}</p>
            <p className={`text-[10px] font-medium ${s.sub} mt-0.5`}>{s.label}</p>
          </div>
        ))}
      </div>

      <Button
        variant="outline" size="sm"
        className="w-full gap-2 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all"
        onClick={() => onSelect(cat)}
      >
        <Eye className="h-4 w-4" /> View All {cat.name}
      </Button>
    </div>
  );
}
