"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Zap } from "lucide-react";
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
      <Card className="group overflow-hidden transition-all hover:shadow-lg border-none bg-white">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            data-ai-hint="product image"
          />
          {isBoosted && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground font-bold flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 fill-current" />
              Boosted
            </Badge>
          )}
          {isAuction && (
            <Badge variant="destructive" className="absolute bottom-2 left-2 font-bold shadow-sm">
              Auction: {timeLeft}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">{title}</h3>
            <span className="font-bold text-primary text-xl">
              R {price.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">{sellerName}</span>
              {isVerified && <VerifiedBadge />}
            </div>
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-bold">{sellerRating}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
