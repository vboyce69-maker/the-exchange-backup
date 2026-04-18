
"use client";

import { Medal, Trophy, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type SellerTier = 'beginner' | 'trusted' | 'pro';

interface SellerTierBadgeProps {
  level: SellerTier;
  className?: string;
}

export function SellerTierBadge({ level, className }: SellerTierBadgeProps) {
  const tiers = {
    beginner: {
      label: "Beginner Seller",
      icon: Medal,
      color: "bg-orange-100 text-orange-700 border-orange-200",
      iconColor: "text-orange-600"
    },
    trusted: {
      label: "Trusted Seller",
      icon: Award,
      color: "bg-slate-100 text-slate-700 border-slate-200",
      iconColor: "text-slate-500"
    },
    pro: {
      label: "Verified Pro",
      icon: Trophy,
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      iconColor: "text-yellow-600"
    }
  };

  const config = tiers[level];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-xl font-black uppercase text-[9px] tracking-widest border shadow-sm",
        config.color,
        className
      )}
    >
      <Icon className={cn("w-3 h-3", config.iconColor)} />
      {config.label}
    </Badge>
  );
}
