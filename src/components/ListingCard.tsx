
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
    <div className="group relative premium-card flex flex-col">
      <Link href={`/listings/${id}`} className="block p-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={imageUrl || "https://picsum.photos/seed/placeholder/800/600"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint="product image"
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isBoosted && (
              <Badge className="bg-accent text-white border-none shadow-lg font-black text-[8px] uppercase px-2 py-1">
                <Zap className="w-2.5 h-2.5 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {isAuction && (
              <Badge className={cn(
                "border-none shadow-lg font-black text-[8px] uppercase px-2 py-1",
                timeLeft === "Ended" ? "bg-slate-500 text-white" : "bg-primary text-white"
              )}>
                <Gavel className="w-2.5 h-2.5 mr-1" />
                {timeLeft === "Ended" ? "Ended" : `${timeLeft}`}
              </Badge>
            )}
          </div>

          <button 
            onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); }}
            className={cn(
              "absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md",
              isSaved ? "bg-pink-500 text-white scale-110" : "bg-white/90 text-slate-400 hover:text-pink-500"
            )}
          >
            <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
          </button>
        </div>
      </Link>

      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-start">
             <Link href={`/listings/${id}`} className="flex-1 min-w-0">
               <h3 className="font-extrabold text-base text-slate-900 line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{title}</h3>
             </Link>
          </div>
          <p className="font-black text-primary text-2xl tracking-tighter leading-none">R {price.toLocaleString()}</p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            {location}
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
                  <Star className="w-3 h-3 text-accent fill-current" />
                  <span>{sellerRating || 4.9}</span>
                </div>
                <VerifiedBadge />
             </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
