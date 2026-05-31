"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Zap,
  ShieldCheck,
  Gavel,
  Clock,
  Heart,
  Layers,
} from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { SellerTierBadge, SellerTier } from "./SellerTierBadge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  sellerName: string;
  sellerRating: number;
  isVerified: boolean;
  isBoosted?: boolean;
  isAuction?: boolean;
  isBulk?: boolean;
  quantity?: number;
  auctionEndDate?: string;
  sellerTransactions?: number;
  sellerReliability?: number;
  isOwner?: boolean;
  onBoost?: () => void;
}

export function ListingCard({
  id,
  title,
  price,
  location,
  imageUrl,
  sellerName,
  sellerRating,
  isVerified,
  isBoosted,
  isAuction,
  isBulk,
  quantity,
  auctionEndDate,
  sellerTransactions = 0,
  sellerReliability = 0,
  isOwner,
  onBoost,
}: ListingCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);

  const getSellerTier = (transactions: number, score: number): SellerTier => {
    if (transactions >= 50 && score >= 95) return "pro";
    if (transactions >= 10 && score >= 90) return "trusted";
    return "beginner";
  };

  const sellerTier = getSellerTier(sellerTransactions, sellerReliability);

  useEffect(() => {
    if (!isAuction || !auctionEndDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auctionEndDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
      } else {
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        setTimeLeft(`${d > 0 ? d + "d " : ""}${h}h ${m}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuction, auctionEndDate]);

  return (
    <div className="group relative premium-card flex flex-col overflow-hidden">
      <Link href={`/listings/${id}`} className="block p-4">
        <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-slate-50 shadow-inner">
          <Image
            src={imageUrl || "https://picsum.photos/seed/placeholder/800/600"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="product image"
          />

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {isBoosted && (
              <Badge className="bg-accent text-white border-none shadow-xl font-black text-[8px] uppercase px-3 py-1 rounded-xl">
                <Zap className="w-2.5 h-2.5 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {isAuction && (
              <Badge
                className={cn(
                  "border-none shadow-xl font-black text-[8px] uppercase px-3 py-1 rounded-xl",
                  timeLeft === "Ended"
                    ? "bg-slate-900/80 text-white"
                    : "bg-primary text-white",
                )}
              >
                <Gavel className="w-2.5 h-2.5 mr-1" />
                {timeLeft === "Ended" ? "Ended" : `${timeLeft}`}
              </Badge>
            )}
            {isBulk && (
              <Badge className="bg-white/90 text-slate-900 border-none shadow-xl font-black text-[8px] uppercase px-3 py-1 rounded-xl backdrop-blur-md">
                <Layers className="w-2.5 h-2.5 mr-1" />
                Lot: {quantity}
              </Badge>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              setIsSaved(!isSaved);
            }}
            className={cn(
              "absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-2xl backdrop-blur-xl border border-white/20",
              isSaved
                ? "bg-pink-500 text-white scale-110"
                : "bg-white/60 text-slate-400 hover:text-pink-500 hover:bg-white",
            )}
          >
            <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
          </button>
        </div>
      </Link>

      <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-4">
            <Link href={`/listings/${id}`} className="flex-1 min-w-0">
              <h3 className="font-black text-lg text-slate-900 line-clamp-1 group-hover:text-primary transition-colors tracking-tight uppercase">
                {title}
              </h3>
            </Link>
          </div>
          <p className="font-black text-primary text-2xl tracking-tighter leading-none">
            R {price.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
          <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            {location}
          </div>
          <div className="flex items-center gap-2">
            <StarRating value={sellerRating || 4.9} />
            <VerifiedBadge />
          </div>
        </div>

        {isOwner && !isBoosted && (
          <div className="pt-4 mt-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onBoost?.();
              }}
              className="w-full bg-[#225BC3] text-white font-black rounded-xl h-10 gap-2 shadow-xl hover:scale-[1.02] transition-all text-[9px] uppercase tracking-widest"
            >
              <Zap className="w-3 h-3 fill-current" /> Boost Item
            </Button>
          </div>
        )}
      </CardContent>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-slate-900 font-black text-[10px]">
      <Star className="w-3 h-3 text-accent fill-current" />
      <span>{value}</span>
    </div>
  );
}
