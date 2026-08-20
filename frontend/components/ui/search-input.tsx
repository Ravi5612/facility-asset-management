import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  iconSize?: "sm" | "md";
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  iconSize = "md",
}: SearchInputProps) {
  const iconCn = iconSize === "sm"
    ? "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
    : "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground";

  return (
    <div className={`relative ${className}`}>
      <Search className={iconCn} />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 bg-background"
      />
    </div>
  );
}
