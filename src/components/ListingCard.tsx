
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Zap, ShieldCheck } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import Link from "next/link";

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
  timeLeft?: string;
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
  timeLeft,
}: ListingCardProps) {
  return (
    <Link href={`/listings/${id}`}>
      <div className="group relative flex flex-col gap-4">
        <div className="relative aspect-[1/1.2] overflow-hidden rounded-[2.5rem] shadow-sm group-hover:shadow-2xl transition-all duration-500">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="luxury property"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isBoosted && (
              <Badge className="bg-accent text-white font-bold border-none shadow-xl px-3 py-1 text-[10px] uppercase">
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {isAuction && (
              <Badge variant="destructive" className="font-bold shadow-xl px-3 py-1 text-[10px] uppercase">
                Live: {timeLeft}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                   <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-xs font-black uppercase tracking-widest">Secure Deal</span>
             </div>
          </div>
        </div>

        <div className="px-2 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-black text-xl text-primary line-clamp-1 group-hover:text-accent transition-colors">{title}</h3>
            <span className="font-black text-accent text-xl">
              {price > 100000 ? `R ${(price / 1000000).toFixed(1)}M` : `R ${price.toLocaleString()}`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-bold uppercase tracking-tight">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              {location}
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-primary uppercase">{sellerName}</span>
               <div className="flex items-center gap-0.5 text-accent">
                 <Star className="w-3 h-3 fill-current" />
                 <span className="text-[10px] font-black">{sellerRating}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
