
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Zap, ShieldCheck, Gavel, Clock } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  auctionEndDate,
}: ListingCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

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
    <Link href={`/listings/${id}`}>
      <div className="group relative flex flex-col gap-4">
        <div className="relative aspect-[1/1.2] overflow-hidden rounded-[2.5rem] shadow-sm group-hover:shadow-2xl transition-all duration-500 bg-white">
          <Image
            src={imageUrl || "https://picsum.photos/seed/placeholder/800/600"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="product image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isBoosted && (
              <Badge className="bg-accent text-white font-black border-none shadow-xl px-3 py-1 text-[10px] uppercase tracking-tighter">
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {isAuction && (
              <Badge className={cn(
                "font-black shadow-xl px-3 py-1 text-[10px] uppercase tracking-tighter border-none",
                timeLeft === "Ended" ? "bg-slate-500 text-white" : "bg-[#225BC3] text-white"
              )}>
                <Gavel className="w-3 h-3 mr-1" />
                {timeLeft === "Ended" ? "Ended" : `Auction: ${timeLeft}`}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                   <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Vetted Seller</span>
             </div>
          </div>
        </div>

        <div className="px-2 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-black text-xl text-[#225BC3] line-clamp-1 group-hover:text-accent transition-colors">{title}</h3>
            <span className="font-black text-accent text-xl">
              R {price.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-tight">
              <MapPin className="w-3.5 h-3.5 text-[#34CBED]" />
              {location}
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-[#225BC3] uppercase">{sellerName || "Alex Rivera"}</span>
               <div className="flex items-center gap-0.5 text-yellow-500">
                 <Star className="w-3 h-3 fill-current" />
                 <span className="text-[9px] font-black">{sellerRating || 4.9}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
