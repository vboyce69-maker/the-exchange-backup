
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Zap, ShieldCheck, Gavel, Clock, Heart, Layers } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
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
}: ListingCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);

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
    <div className="group relative flex flex-col gap-4">
      <Link href={`/listings/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-[2.5rem] shadow-sm group-hover:shadow-2xl transition-all duration-500 bg-white border border-slate-100">
          <Image
            src={imageUrl || "https://picsum.photos/seed/placeholder/800/600"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="product image"
          />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isBoosted && (
              <Badge className="bg-[#FF8C00] text-white font-black border-none shadow-xl px-3 py-1 text-[9px] uppercase tracking-tighter">
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {isAuction && (
              <Badge className={cn(
                "font-black shadow-xl px-3 py-1 text-[9px] uppercase tracking-tighter border-none",
                timeLeft === "Ended" ? "bg-slate-500 text-white" : "bg-[#225BC3] text-white"
              )}>
                <Gavel className="w-3 h-3 mr-1" />
                {timeLeft === "Ended" ? "Ended" : `${timeLeft}`}
              </Badge>
            )}
            {isBulk && (
              <Badge className="bg-white/90 backdrop-blur-md text-[#225BC3] font-black border-none shadow-lg px-3 py-1 text-[9px] uppercase tracking-tighter">
                <Layers className="w-3 h-3 mr-1" />
                Bulk Lot ({quantity})
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {/* FB Marketplace/Amazon style Save Button */}
      <button 
        onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); }}
        className={cn(
          "absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-sm",
          isSaved ? "bg-pink-500 text-white scale-110" : "bg-white/80 text-slate-400 hover:text-pink-500 hover:bg-white"
        )}
      >
        <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
      </button>

      <div className="px-3 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <Link href={`/listings/${id}`} className="flex-1">
            <h3 className="font-black text-lg text-slate-900 line-clamp-1 group-hover:text-[#225BC3] transition-colors tracking-tight">{title}</h3>
          </Link>
          <span className="font-black text-[#225BC3] text-xl whitespace-nowrap">
            R {price.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-tight">
            <MapPin className="w-3.5 h-3.5 text-[#34CBED]" />
            {location}
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-0.5 text-yellow-500">
               <Star className="w-3 h-3 fill-current" />
               <span className="text-[10px] font-black">{sellerRating || 4.9}</span>
             </div>
             <VerifiedBadge />
          </div>
        </div>

        {/* Amazon style Quick Action */}
        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <Link href={`/listings/${id}`}>
              <Button className="w-full h-10 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">View Details</Button>
           </Link>
        </div>
      </div>
    </div>
  );
}
