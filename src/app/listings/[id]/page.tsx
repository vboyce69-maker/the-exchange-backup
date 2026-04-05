
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Share2, 
  Flag, 
  Clock,
  Star,
  Info,
  Gavel,
  Trophy,
  History
} from "lucide-react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

export default function ListingDetailPage() {
  const { id } = useParams();
  const [bidAmount, setBidAmount] = useState("");

  // Mock data for detail view
  // In a real app, this would be fetched via useDoc hook
  const listing = {
    id,
    title: "Mountain Bike XT-400",
    price: 4500,
    description: "In excellent condition. Recently serviced with brand new tires. Perfect for trail riding and weekend adventures. Includes specialized helmet and bike lock.",
    location: "Downtown, Metro City",
    imageUrl: "https://picsum.photos/seed/bike/800/600",
    sellerName: "Alex Rivera",
    sellerRating: 4.9,
    sellerReliability: 95,
    isVerified: true,
    isAuction: id === "a1" || id === "a2" || id === "a3" || false, // Simulate auction if it's from the auction list
    postedDate: "2 days ago",
    category: "Sports",
    currentBid: 4200,
    bidCount: 12,
    timeLeft: "5h 12m"
  };

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= listing.currentBid) {
      toast({
        variant: "destructive",
        title: "Invalid Bid",
        description: `Your bid must be higher than R ${listing.currentBid.toLocaleString()}.`,
      });
      return;
    }

    toast({
      title: "Bid Placed!",
      description: `You are now the highest bidder at R ${amount.toLocaleString()}.`,
    });
    setBidAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden border bg-white shadow-sm">
              <Image 
                src={listing.imageUrl} 
                alt={listing.title} 
                fill 
                className="object-cover"
                data-ai-hint="product detail"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border bg-white cursor-pointer hover:opacity-80 transition-opacity">
                  <Image src={`https://picsum.photos/seed/bike-${i}/200/200`} alt="thumb" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline">{listing.category}</Badge>
                  {listing.isAuction && (
                    <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                      Live Auction
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold font-headline">{listing.title}</h1>
                <p className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
                  <MapPin className="w-4 h-4" /> {listing.location} • Posted {listing.postedDate}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Flag className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {listing.isAuction ? (
              <Card className="rounded-3xl border shadow-lg overflow-hidden bg-white">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <Gavel className="w-5 h-5" />
                      Bidding Panel
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-destructive font-bold text-sm">
                      <Clock className="w-4 h-4" />
                      Ends in: {listing.timeLeft}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background p-4 rounded-2xl border flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Current Bid</span>
                      <span className="text-2xl font-bold text-primary">R {listing.currentBid.toLocaleString()}</span>
                    </div>
                    <div className="bg-background p-4 rounded-2xl border flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Bids Placed</span>
                      <span className="text-2xl font-bold">{listing.bidCount}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R</span>
                        <Input 
                          type="number" 
                          placeholder="Enter higher bid..." 
                          className="pl-8 h-12 rounded-xl text-lg font-bold"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                        />
                      </div>
                      <Button className="h-12 px-8 rounded-xl bg-primary text-white font-bold" onClick={handlePlaceBid}>
                        Place Bid
                      </Button>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground">
                      Minimum next bid: <span className="font-bold">R {(listing.currentBid + 100).toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-center py-2 bg-green-50 rounded-xl text-green-700 text-xs font-medium">
                    <Trophy className="w-4 h-4" />
                    Highest bidder wins at the end of the period.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-primary">R {listing.price.toLocaleString()}</span>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200">Available</Badge>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-primary text-white font-bold h-12 rounded-xl">
                    <MessageSquare className="w-5 h-5 mr-2" /> Chat with Seller
                  </Button>
                  <Button variant="outline" className="flex-1 border-primary text-primary font-bold h-12 rounded-xl">
                    Buy Now
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  Secure Escrow Protection Enabled
                </p>
              </div>
            )}

            <Card className="rounded-2xl border bg-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-primary">
                  <Info className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-secondary/30 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border">
                      <Image src="https://picsum.photos/seed/user1/100/100" alt="seller" fill />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{listing.sellerName}</span>
                        {listing.isVerified && <VerifiedBadge />}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-bold">{listing.sellerRating}</span>
                        <span className="text-muted-foreground ml-1">(42 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/profile/${listing.sellerName.toLowerCase()}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-white">View Profile</Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Reliability Score</p>
                    <p className="text-xl font-bold text-primary">{listing.sellerReliability}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Deals Completed</p>
                    <p className="text-xl font-bold">128</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
