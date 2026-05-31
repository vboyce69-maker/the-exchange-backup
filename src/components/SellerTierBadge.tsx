"use client";

import { Medal, Trophy, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type SellerTier = "beginner" | "trusted" | "pro";

interface SellerTierBadgeProps {
  level: SellerTier;
  className?: string;
}

export function SellerTierBadge({ level, className }: SellerTierBadgeProps) {
  const tiers = {
    beginner: {
      label: "Beginner",
      icon: Medal,
      color: "bg-orange-50 text-orange-600 border-orange-100",
      iconColor: "text-orange-500",
    },
    trusted: {
      label: "Trusted",
      icon: Award,
      color: "bg-slate-50 text-slate-600 border-slate-100",
      iconColor: "text-slate-400",
    },
    pro: {
      label: "Verified Pro",
      icon: Trophy,
      color: "bg-yellow-50 text-yellow-700 border-yellow-100",
      iconColor: "text-yellow-600",
    },
  };

  const config = tiers[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold uppercase text-[8px] tracking-widest border shadow-sm",
        config.color,
        className,
      )}
    >
      <Icon className={cn("w-3 h-3", config.iconColor)} />
      {config.label}
    </div>
  );
}
