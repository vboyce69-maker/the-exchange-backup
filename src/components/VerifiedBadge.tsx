
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VerifiedBadge() {
  return (
    <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 flex items-center gap-1 py-0.5 px-2">
      <ShieldCheck className="w-3 h-3" />
      <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
    </Badge>
  );
}
