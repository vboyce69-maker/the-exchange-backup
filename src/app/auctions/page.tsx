
"use client";

import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AUCTION_LISTINGS = [
  {
    id: "a1",
    title: "Canon EOS R5 Mirrorless",
    price: 48000,
    location: "South Park, Queens",
    imageUrl: "https://picsum.photos/seed/camera/600/400",
    sellerName: "Studio Pix",
    sellerRating: 4.7,
    isVerified: false,
    isAuction: true,
    timeLeft: "2h 45m",
  },
  {
    id: "a2",
    title: "Gaming Laptop Pro 16",
    price: 25000,
    location: "Central District",
    imageUrl: "https://picsum.photos/seed/laptop/600/400",
    sellerName: "PC Masters",
    sellerRating: 4.6,
    isVerified: false,
    isAuction: true,
    timeLeft: "5h 12m",
  },
  {
    id: "a3",
    title: "DJI Mavic 3 Drone",
    price: 32000,
    location: "Skyview Heights",
    imageUrl: "https://picsum.photos/seed/drone/600/400",
    sellerName: "FlyHigh",
    sellerRating: 4.9,
    isVerified: true,
    isAuction: true,
    timeLeft: "1d 2h",
  }
];

export default function AuctionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Live Bidding</Badge>
          <h1 className="text-4xl font-headline font-bold mb-4 flex items-center gap-3">
            <Gavel className="w-8 h-8 text-primary" />
            Verified Auctions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Bid on premium items from verified sellers. All auctions are secured by our escrow system.
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="bg-white border p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg">All Auctions</TabsTrigger>
            <TabsTrigger value="ending" className="rounded-lg">Ending Soon</TabsTrigger>
            <TabsTrigger value="trending" className="rounded-lg">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {AUCTION_LISTINGS.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="ending">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {AUCTION_LISTINGS.filter(l => l.timeLeft.includes('h') || l.timeLeft.includes('m')).map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
