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
}

export function AssetCategoryCard({ cat, onSelect }: AssetCategoryCardProps) {
  const Icon = getCategoryIcon(cat.category);
  const total = cat.items.length;
  const assigned = cat.items.filter(i => i.status === "Assigned").length;
  const available = cat.items.filter(i => i.status === "Available").length;
  const bad = cat.items.filter(i => i.status === "Dump" || i.status === "Repair").length;

  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-brand-primary transition-all group flex flex-col gap-4">
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
          { label: "Available", value: available, bg: "bg-muted/50", text: "text-foreground", sub: "text-muted-foreground" },
          { label: "Dump/Rep", value: bad, bg: "bg-brand-danger/10", text: "text-brand-danger", sub: "text-brand-danger/70" },
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
