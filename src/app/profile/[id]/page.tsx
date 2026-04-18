
"use client";

import { useMemo } from "react";
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
  ShieldCheck, 
  MessageSquare, 
  Shield,
  Loader2,
  Package,
  Info,
  Quote,
  Calendar,
  Smartphone,
  MapPin,
  ScanFace,
  FileCheck
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function UserProfilePage() {
  const { id } = useParams();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!id || id === 'me') return null;
    return doc(db, "userProfiles", id as string);
  }, [db, id]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const userListingsQuery = useMemoFirebase(() => {
    if (!id || id === 'me') return null;
    return query(collection(db, "publicListings"), where("sellerId", "==", id));
  }, [db, id]);

  const { data: listings, isLoading: isListingsLoading } = useCollection(userListingsQuery);

  const reviewsQuery = useMemoFirebase(() => {
    if (!id || id === 'me') return null;
    return query(
      collection(db, "userProfiles", id as string, "reviews"),
      orderBy("createdAt", "desc")
    );
  }, [db, id]);

  const { data: reviews, isLoading: isReviewsLoading } = useCollection(reviewsQuery);

  const satisfactionScore = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return Math.round((total / (reviews.length * 5)) * 100);
  }, [reviews]);

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#EEF1F3]">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-[#225BC3] mb-4" />
          <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Syncing Identity...</p>
        </div>
      </div>
    );
  }

  const user = profile || {
    id: "anonymous",
    firstName: "Anonymous",
    lastName: "User",
    bio: "Identity under verification.",
    locationName: "South Africa",
    reliabilityScore: 50,
    registrationDate: new Date().toISOString(),
    isIdVerified: false,
    profileImageUrl: `https://picsum.photos/seed/${id}/200/200`
  };

  const verificationPillars = [
    { name: "Phone", icon: Smartphone, status: true },
    { name: "ID Document", icon: FileCheck, status: user.isIdVerified },
    { name: "Face Scan", icon: ScanFace, status: user.isIdVerified },
    { name: "Address", icon: MapPin, status: user.isIdVerified },
  ];

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
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                  {user.isIdVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-2xl shadow-xl">
                        <ShieldCheck className="w-12 h-12 text-[#34CBED] fill-white" />
                    </div>
                  )}
                </div>
                
                <h1 className="text-4xl font-black text-[#225BC3] mb-2 leading-none uppercase tracking-tighter">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex items-center gap-2 mb-6">
                   {user.isIdVerified && <VerifiedBadge />}
                   <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                     Joined {new Date(user.registrationDate).getFullYear()}
                   </span>
                </div>
                
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 px-4 italic">
                  "{user.bio}"
                </p>

                <div className="w-full grid grid-cols-2 gap-2 mb-8">
                  {verificationPillars.map((p) => (
                    <div key={p.name} className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border gap-1 transition-all",
                      p.status ? "bg-green-50 border-green-100 text-green-700" : "bg-slate-50 border-slate-100 text-slate-400 opacity-50"
                    )}>
                      <p.icon className="w-4 h-4" />
                      <span className="text-[7px] font-black uppercase tracking-widest">{p.name}</span>
                      {p.status && <CheckCircle2 className="w-2.5 h-2.5" />}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 gap-3 w-full">
                  <Button className="w-full rounded-2xl bg-[#225BC3] font-black h-14 shadow-xl uppercase text-[10px] tracking-widest">
                    <MessageSquare className="w-5 h-5 mr-2" /> Start Chat
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-[#225BC3] uppercase tracking-widest">Reliability Score</h3>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><Info className="h-4 w-4 text-slate-300" /></Button>
                </div>

                <div className="flex flex-col items-center">
                   <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={314} strokeDashoffset={314 * (1 - (user.reliabilityScore || 50) / 100)} className="text-[#34CBED]" />
                      </svg>
                      <span className="absolute text-2xl font-black text-[#225BC3]">{user.reliabilityScore || 50}%</span>
                   </div>
                   <Badge className="bg-[#34CBED] text-white font-black border-none px-4 py-1 text-[8px] uppercase tracking-widest">
                     {user.reliabilityScore > 80 ? "Premium Behavior" : "Standard Behavior"}
                   </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white rounded-3xl p-1.5 h-16 w-full lg:w-fit shadow-xl">
                <TabsTrigger value="active" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs">For Sale</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs">Buyer Trust ({reviews?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-10">
                {isListingsLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#225BC3]" />
                  </div>
                ) : listings && listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {listings.map(listing => (
                      <ListingCard 
                        key={listing.id} 
                        id={listing.id}
                        title={listing.title}
                        price={listing.price}
                        location={listing.location || "Local"}
                        imageUrl={listing.imageUrls?.[0]}
                        sellerName={`${user.firstName} ${user.lastName}`}
                        sellerRating={4.9}
                        isVerified={user.isIdVerified}
                        isAuction={listing.isAuction}
                        isBulk={listing.isBulk}
                        quantity={listing.quantity}
                        auctionEndDate={listing.auctionEndDate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm">
                    <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="font-black text-[#225BC3] uppercase tracking-widest">No Active Inventory</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-10 space-y-6">
                {isReviewsLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#225BC3]" />
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id} className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-4 h-4", i < review.rating ? "text-[#FF8C00] fill-current" : "text-slate-100")} />
                              ))}
                              <span className="text-[9px] font-black text-[#FF8C00] uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full ml-2">Verified Trade</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="text-slate-700 font-medium leading-relaxed italic">
                            "{review.comment}"
                          </p>

                          <div className="pt-4 flex items-center gap-3">
                             <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                               <AvatarFallback className="bg-[#225BC3]/5 text-[#225BC3] text-[10px] font-black">{review.buyerName?.[0] || "B"}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="text-xs font-black text-slate-900 leading-none">{review.buyerName || "Private Buyer"}</p>
                               <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Purchased: {review.listingTitle || "Marketplace Listing"}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm">
                    <Quote className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="font-black text-[#225BC3] uppercase tracking-widest">Awaiting First Review</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
