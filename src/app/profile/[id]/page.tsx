
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
  Award,
  AlertTriangle,
  ChevronRight,
  Info,
  Scale
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function UserProfilePage() {
  const { id } = useParams();

  const user = {
    id,
    name: "Alex Rivera",
    bio: "Avid mountain biker and tech enthusiast. Selling quality gear I no longer use.",
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
    soldHistory: []
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar */}
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
                  <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-2xl shadow-xl">
                      <ShieldCheck className="w-12 h-12 text-[#34CBED] fill-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-black text-[#225BC3] mb-2 leading-none">{user.name}</h1>
                <div className="flex items-center gap-2 mb-6">
                   <VerifiedBadge />
                   <span className="text-muted-foreground font-bold text-xs">Member since {user.memberSince}</span>
                </div>
                
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 px-4 italic">
                  "{user.bio}"
                </p>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-8 text-left">
                  <h4 className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Badge Disclaimer
                  </h4>
                  <p className="text-[9px] text-blue-700 font-bold leading-tight">
                    Verified badges confirm specific identity steps were completed. They do not guarantee honesty, item quality, or ownership of goods.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 w-full">
                  <Button className="w-full rounded-2xl bg-[#225BC3] font-black h-14 shadow-xl">
                    <MessageSquare className="w-5 h-5 mr-2" /> Message Seller
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-lg text-[#225BC3] uppercase">Reliability</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground"><Info className="h-4 w-4" /></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 rounded-3xl p-6 shadow-2xl border-none ring-1 ring-[#225BC3]/10">
                      <h4 className="font-black text-[#225BC3] uppercase text-xs tracking-widest mb-3">Score Disclaimer</h4>
                      <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                        Reliability scores are based on platform activity (meetups, no-shows, feedback). They are for information only and NOT a guarantee of transaction outcome or safety.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col items-center">
                   <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - user.reliability / 100)} className="text-[#34CBED]" />
                      </svg>
                      <span className="absolute text-4xl font-black text-[#225BC3]">{user.reliability}%</span>
                   </div>
                   <Badge className="bg-[#34CBED] text-white font-black border-none px-4 py-1">Trusted Seller</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white rounded-3xl p-1.5 h-16 w-full lg:w-fit shadow-xl">
                <TabsTrigger value="active" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs">Items For Sale</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {user.activeListings.map(listing => (
                    <ListingCard key={listing.id} {...listing} />
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
