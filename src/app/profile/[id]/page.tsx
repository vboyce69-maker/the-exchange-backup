
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
  ExternalLink,
  Shield,
  Zap,
  TrendingUp,
  Award
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-10 ring-1 ring-[#225BC3]/5">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-36 h-36 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
                    <Avatar className="w-full h-full">
                      <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                      <AvatarFallback>AR</AvatarFallback>
                    </Avatar>
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-2xl shadow-xl">
                      <ShieldCheck className="w-12 h-12 text-[#34CBED] fill-white" />
                    </div>
                  )}
                </div>
                
                <h1 className="text-4xl font-black text-[#225BC3] mb-2 leading-none">{user.name}</h1>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1 text-yellow-500 font-black text-lg">
                    <Star className="w-5 h-5 fill-current" />
                    {user.rating}
                  </div>
                  <span className="text-muted-foreground font-bold text-sm">({user.reviewsCount} deals)</span>
                </div>
                
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 px-4">
                  "{user.bio}"
                </p>
                
                <div className="w-full space-y-4 mb-10">
                  <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-50">
                    <span className="text-muted-foreground font-bold uppercase text-[10px] flex items-center gap-2 tracking-widest">
                      <MapPin className="w-3 h-3 text-[#34CBED]" /> Location
                    </span>
                    <span className="font-black text-[#225BC3]">{user.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-50">
                    <span className="text-muted-foreground font-bold uppercase text-[10px] flex items-center gap-2 tracking-widest">
                      <Calendar className="w-3 h-3 text-[#34CBED]" /> Member
                    </span>
                    <span className="font-black text-[#225BC3]">{user.memberSince}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-bold uppercase text-[10px] flex items-center gap-2 tracking-widest">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> Identity
                    </span>
                    <span className="font-black text-green-600">ID Verified</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 w-full">
                  <Button className="w-full rounded-2xl bg-[#225BC3] font-black h-14 shadow-xl">
                    <MessageSquare className="w-5 h-5 mr-2" /> Message Seller
                  </Button>
                  <Button variant="ghost" className="w-full rounded-2xl text-destructive font-bold h-12 hover:bg-destructive/5">
                    <Flag className="w-4 h-4 mr-2" /> Report Behavior
                  </Button>
                </div>
              </div>
            </Card>

            {/* RELIABILITY SCORE CARD */}
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 ring-1 ring-[#34CBED]/10">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#34CBED]" />
                    <h3 className="font-black text-lg text-[#225BC3] uppercase tracking-tighter">Reliability Score</h3>
                  </div>
                  <Badge className="bg-[#34CBED] text-white font-black border-none text-md h-8 px-4">
                    {user.reliability}%
                  </Badge>
                </div>
                <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-[#34CBED] rounded-full transition-all duration-1000" style={{ width: `${user.reliability}%` }} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                    <p className="text-[10px] uppercase font-black text-[#225BC3]/60 mb-1 tracking-widest">Total Sales</p>
                    <p className="text-3xl font-black text-[#225BC3]">{user.salesCount}</p>
                  </div>
                  <div className="p-5 bg-green-50/50 rounded-3xl border border-green-100/50">
                    <p className="text-[10px] uppercase font-black text-green-600/60 mb-1 tracking-widest">Behavior</p>
                    <div className="flex items-center gap-1 text-green-700 font-black">
                      <Award className="w-4 h-4" /> Top Tier
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tracked Actions</p>
                  <div className="grid grid-cols-2 gap-y-2 text-[10px] font-bold">
                    <span className="text-green-600">Showed Up: +5</span>
                    <span className="text-green-600">Completed: +10</span>
                    <span className="text-red-500">Late: -3</span>
                    <span className="text-red-600">No Show: -15</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white rounded-3xl p-1.5 h-16 w-full lg:w-fit shadow-xl border border-slate-100">
                <TabsTrigger value="active" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs tracking-widest">
                  Items For Sale ({user.activeListings.length})
                </TabsTrigger>
                <TabsTrigger value="sold" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs tracking-widest">
                  Sold History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {user.activeListings.map(listing => (
                    <ListingCard key={listing.id} {...listing} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="sold" className="mt-10">
                <div className="space-y-4">
                  {user.soldHistory.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-xl text-[#225BC3]">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                            <Clock className="w-4 h-4" /> Successfully Trade • {item.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#225BC3]">R {item.price.toLocaleString()}</p>
                        <Badge className="bg-green-100 text-green-700 border-none font-bold text-[9px] uppercase tracking-widest">Deal Completed</Badge>
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
