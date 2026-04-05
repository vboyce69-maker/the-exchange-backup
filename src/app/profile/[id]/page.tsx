
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Flag, 
  MessageSquare,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export default function UserProfilePage() {
  const { id } = useParams();

  const user = {
    id,
    name: "Alex Rivera",
    bio: "Avid mountain biker and tech enthusiast. Selling quality gear I no longer use. I value safe and honest trades.",
    location: "Metro City, GP",
    rating: 4.9,
    reviewsCount: 42,
    reliability: 96,
    memberSince: "January 2023",
    isVerified: true,
    salesCount: 128,
    activeListings: [
      {
        id: "1",
        title: "Mountain Bike XT-400",
        price: 4500,
        location: "Metro City",
        imageUrl: "https://picsum.photos/seed/bike/600/400",
        sellerName: "Alex Rivera",
        sellerRating: 4.9,
        isVerified: true,
      }
    ],
    soldHistory: [
      {
        id: "s1",
        title: "Canon Camera Lens 50mm",
        price: 2200,
        date: "2 weeks ago"
      },
      {
        id: "s2",
        title: "Apple Watch Series 7",
        price: 3500,
        date: "1 month ago"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <Avatar className="w-32 h-32 border-4 border-primary/10">
                    <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                    <AvatarFallback>AR</AvatarFallback>
                  </Avatar>
                  {user.isVerified && (
                    <div className="absolute -bottom-2 -right-2">
                      <ShieldCheck className="w-10 h-10 text-primary fill-white" />
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl font-black text-[#225BC3] mb-1">{user.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    {user.rating}
                  </div>
                  <span className="text-muted-foreground text-sm">({user.reviewsCount} reviews)</span>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {user.bio}
                </p>
                
                <div className="w-full space-y-3 mb-8">
                  <div className="flex justify-between items-center text-sm border-b pb-3">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Location
                    </span>
                    <span className="font-bold">{user.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-3">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Member since
                    </span>
                    <span className="font-bold">{user.memberSince}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-3">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Phone
                    </span>
                    <span className="font-bold text-green-600">Verified</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button className="w-full rounded-2xl bg-[#225BC3] font-bold">
                    <MessageSquare className="w-4 h-4 mr-2" /> Message
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl border-destructive text-destructive hover:bg-destructive/5 font-bold">
                    <Flag className="w-4 h-4 mr-2" /> Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Reliability Stats */}
            <Card className="rounded-[2rem] border-none shadow-md bg-white p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-[#225BC3]">Reliability Score</h3>
                  <Badge className="bg-primary/10 text-primary">{user.reliability}%</Badge>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${user.reliability}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Sales</p>
                    <p className="text-2xl font-black">{user.salesCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Response Time</p>
                    <p className="text-2xl font-black">&lt; 1hr</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content (Listings) */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white rounded-[1.5rem] p-1 h-14 w-full lg:w-fit shadow-sm border border-slate-100">
                <TabsTrigger value="active" className="rounded-2xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
                  Active Items ({user.activeListings.length})
                </TabsTrigger>
                <TabsTrigger value="sold" className="rounded-2xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
                  Sold History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.activeListings.map(listing => (
                    <ListingCard key={listing.id} {...listing} />
                  ))}
                  {user.activeListings.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">No active listings found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="sold" className="mt-8">
                <div className="space-y-4">
                  {user.soldHistory.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" /> Sold {item.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-primary">R {item.price.toLocaleString()}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">Confirmed Sale</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
