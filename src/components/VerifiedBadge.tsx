
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VerifiedBadge() {
  return (
    <div className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-lg border border-secondary/20">
      <ShieldCheck className="w-3 h-3" />
      <span className="text-[9px] font-black uppercase tracking-wider">Verified</span>
    </div>
  );
}
