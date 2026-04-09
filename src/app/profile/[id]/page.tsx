
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
  Calendar
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

  // Fetch real profile data
  const profileRef = useMemoFirebase(() => {
    if (!id || id === 'me') return null;
    return doc(db, "userProfiles", id as string);
  }, [db, id]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Fetch listings for this user
  const userListingsQuery = useMemoFirebase(() => {
    if (!id || id === 'me') return null;
    return query(collection(db, "publicListings"), where("sellerId", "==", id));
  }, [db, id]);

  const { data: listings, isLoading: isListingsLoading } = useCollection(userListingsQuery);

  // Fetch reviews for this user
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
          <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const user = profile || {
    id: "anonymous",
    firstName: "Anonymous",
    lastName: "User",
    bio: "This profile information is not available.",
    locationName: "Unknown",
    reliabilityScore: 50,
    registrationDate: new Date().toISOString(),
    isIdVerified: false,
    profileImageUrl: `https://picsum.photos/seed/${id}/200/200`
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
                
                <h1 className="text-4xl font-black text-[#225BC3] mb-2 leading-none">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex items-center gap-2 mb-6">
                   {user.isIdVerified && <VerifiedBadge />}
                   <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                     Member since {new Date(user.registrationDate).getFullYear()}
                   </span>
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

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-8">
              {/* Reliability Score */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-[#225BC3] uppercase tracking-widest">Reliability Score</h3>
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
                   <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={314} strokeDashoffset={314 * (1 - (user.reliabilityScore || 50) / 100)} className="text-[#34CBED]" />
                      </svg>
                      <span className="absolute text-2xl font-black text-[#225BC3]">{user.reliabilityScore || 50}%</span>
                   </div>
                   <Badge className="bg-[#34CBED] text-white font-black border-none px-4 py-1 text-[8px] uppercase">
                     {user.reliabilityScore > 80 ? "Trusted behavior" : "New behavior"}
                   </Badge>
                </div>
              </div>

              {/* Satisfaction Score */}
              <div className="pt-8 border-t space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-[#FF8C00] uppercase tracking-widest">Buyer Satisfaction</h3>
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF8C00]"><Star className="w-4 h-4 fill-current" /></div>
                </div>

                <div className="flex flex-col items-center">
                   <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={314} strokeDashoffset={314 * (1 - (satisfactionScore || 0) / 100)} className="text-[#FF8C00]" />
                      </svg>
                      <span className="absolute text-2xl font-black text-[#FF8C00]">{satisfactionScore}%</span>
                   </div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">From {reviews?.length || 0} reviews</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white rounded-3xl p-1.5 h-16 w-full lg:w-fit shadow-xl">
                <TabsTrigger value="active" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs">Items For Sale</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs">Buyer Reviews ({reviews?.length || 0})</TabsTrigger>
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
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="font-black text-[#225BC3] uppercase tracking-widest">No active listings</p>
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
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "w-4 h-4", 
                                    i < review.rating ? "text-[#FF8C00] fill-current" : "text-slate-200"
                                  )} 
                                />
                              ))}
                              <span className="text-xs font-black text-[#FF8C00] ml-2">Verified Purchase</span>
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#225BC3]/5" />
                            <p className="text-slate-700 font-medium leading-relaxed relative z-10 pl-4 italic">
                              "{review.comment}"
                            </p>
                          </div>

                          <div className="pt-4 flex items-center gap-3">
                             <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                               <AvatarFallback className="bg-[#225BC3]/5 text-[#225BC3] text-[10px] font-black">
                                 {review.buyerName?.[0] || "B"}
                               </AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="text-xs font-black text-slate-900 leading-none mb-1">{review.buyerName || "Anonymous Buyer"}</p>
                               <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Purchased: {review.listingTitle || "Marketplace Item"}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm">
                    <Quote className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="font-black text-[#225BC3] uppercase tracking-widest">No reviews yet</p>
                    <p className="text-muted-foreground text-sm font-medium">Completed deals will appear here once rated.</p>
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
