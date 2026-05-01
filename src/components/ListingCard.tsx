"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Zap, ShieldCheck, Gavel, Clock, Heart, Layers } from "lucide-react";
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
}: ListingCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);

  // Determine Seller Tier
  const getSellerTier = (transactions: number, score: number): SellerTier => {
    if (transactions >= 50 && score >= 95) return 'pro';
    if (transactions >= 10 && score >= 90) return 'trusted';
    return 'beginner';
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
        setTimeLeft(`${d > 0 ? d + 'd ' : ''}${h}h ${m}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuction, auctionEndDate]);

  return (
    <div className="group relative flex flex-col gap-2 lg:gap-4">
      <Link href={`/listings/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm group-hover:shadow-2xl transition-all duration-500 bg-white border border-slate-100">
          <Image
            src={imageUrl || "https://picsum.photos/seed/placeholder/800/600"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="product image"
          />
          
          <div className="absolute top-2.5 left-2.5 lg:top-4 lg:left-4 flex flex-col gap-1.5 lg:gap-2">
            {isBoosted && (
              <Badge className="bg-[#FF8C00] text-white font-black border-none shadow-xl px-2 py-0.5 lg:px-3 lg:py-1 text-[7px] lg:text-[9px] uppercase tracking-tighter">
                <Zap className="w-2 h-2 lg:w-3 lg:h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {isAuction && (
              <Badge className={cn(
                "font-black shadow-xl px-2 py-0.5 lg:px-3 lg:py-1 text-[7px] lg:text-[9px] uppercase tracking-tighter border-none",
                timeLeft === "Ended" ? "bg-slate-500 text-white" : "bg-[#225BC3] text-white"
              )}>
                <Gavel className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                {timeLeft === "Ended" ? "Ended" : `${timeLeft}`}
              </Badge>
            )}
            {isBulk && (
              <Badge className="bg-white/90 backdrop-blur-md text-[#225BC3] font-black border-none shadow-lg px-2 py-0.5 lg:px-3 lg:py-1 text-[7px] lg:text-[9px] uppercase tracking-tighter">
                <Layers className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                Bulk ({quantity})
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <button 
        onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); }}
        className={cn(
          "absolute top-2.5 right-2.5 lg:top-4 lg:right-4 z-10 w-8 h-8 lg:w-11 lg:h-11 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-sm",
          isSaved ? "bg-pink-500 text-white scale-110" : "bg-white/80 text-slate-400 hover:text-pink-500 hover:bg-white"
        )}
      >
        <Heart className={cn("w-3.5 h-3.5 lg:w-5 lg:h-5", isSaved && "fill-current")} />
      </button>

      <div className="px-1 lg:px-3 space-y-1 lg:space-y-2">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-0.5 lg:gap-1">
          <Link href={`/listings/${id}`} className="flex-1 w-full">
            <h3 className="font-black text-xs lg:text-lg text-slate-900 line-clamp-1 group-hover:text-[#225BC3] transition-colors tracking-tight">{title}</h3>
          </Link>
          <span className="font-black text-[#225BC3] text-sm lg:text-xl whitespace-nowrap leading-none">
            R {price.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-tight">
            <MapPin className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-[#34CBED]" />
            {location}
          </div>
          <div className="flex flex-col items-end gap-0.5">
             <div className="flex items-center gap-1 lg:gap-2">
                <div className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="w-2 h-2 lg:w-3 lg:h-3 fill-current" />
                  <span className="text-[8px] lg:text-[10px] font-black">{sellerRating || 4.9}</span>
                </div>
                <VerifiedBadge />
             </div>
             <SellerTierBadge level={sellerTier} className="scale-[0.65] lg:scale-75 origin-right" />
          </div>
        </div>

        <div className="pt-1.5 lg:pt-2 opacity-0 lg:group-hover:opacity-100 transition-opacity hidden sm:block">
           <Link href={`/listings/${id}`}>
              <Button className="w-full h-8 lg:h-10 rounded-xl bg-slate-900 text-white font-black text-[8px] lg:text-[10px] uppercase tracking-widest shadow-lg">View Details</Button>
           </Link>
        </div>
      </div>
    </div>
  );
}
