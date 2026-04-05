
"use client";

import { useParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Share2, 
  Flag, 
  Clock,
  Star,
  Info
} from "lucide-react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import Link from "next/link";

export default function ListingDetailPage() {
  const { id } = useParams();

  // Mock data for detail view
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
    isAuction: false,
    postedDate: "2 days ago",
    category: "Sports"
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
                <Badge variant="outline" className="mb-2">{listing.category}</Badge>
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

            <Card className="rounded-2xl border bg-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
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
