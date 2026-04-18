
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
  FileCheck,
  CheckCircle2,
  TrendingUp,
  History,
  AlertCircle,
  Medal
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SellerTierBadge, SellerTier } from "@/components/SellerTierBadge";
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
    firstName: "Verified",
    lastName: "Seller",
    bio: "Passionate local trader committed to high-trust community commerce.",
    locationName: "South Africa",
    reliabilityScore: 94,
    transactionsCompleted: 56,
    disputeCount: 0,
    registrationDate: "2023-01-15T10:00:00Z",
    isIdVerified: true,
    profileImageUrl: `https://picsum.photos/seed/${id}/200/200`
  };

  // Determine Seller Tier
  const getSellerTier = (transactions: number, score: number): SellerTier => {
    if (transactions >= 50 && score >= 95) return 'pro';
    if (transactions >= 10 && score >= 90) return 'trusted';
    return 'beginner';
  };

  const sellerTier = getSellerTier(user.transactionsCompleted || 0, user.reliabilityScore || 0);

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
                <div className="flex flex-col items-center gap-3 mb-6">
                   <div className="flex items-center gap-2">
                     {user.isIdVerified && <VerifiedBadge />}
                     <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
                       Since {new Date(user.registrationDate).getFullYear()}
                     </span>
                   </div>
                   <SellerTierBadge level={sellerTier} />
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
                
                <Button className="w-full rounded-2xl bg-[#225BC3] font-black h-14 shadow-xl uppercase text-[10px] tracking-widest">
                  <MessageSquare className="w-5 h-5 mr-2" /> Start Secure Chat
                </Button>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-[#225BC3] uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Performance
                  </h3>
                  <Badge className="bg-green-100 text-green-700 border-none font-black text-[9px] uppercase">Highly Reliable</Badge>
                </div>

                <div className="flex flex-col items-center">
                   <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={314} strokeDashoffset={314 * (1 - (user.reliabilityScore || 50) / 100)} className="text-[#225BC3]" />
                      </svg>
                      <div className="absolute flex flex-col items-center leading-none">
                        <span className="text-2xl font-black text-[#225BC3]">{user.reliabilityScore || 50}%</span>
                        <span className="text-[7px] font-black uppercase text-slate-400 tracking-tighter">Trust Score</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trades</p>
                    <p className="text-lg font-black text-[#225BC3]">{user.transactionsCompleted || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Disputes</p>
                    <p className={cn("text-lg font-black", (user.disputeCount || 0) > 0 ? "text-red-500" : "text-green-600")}>
                      {user.disputeCount || 0}
                    </p>
                  </div>
                </div>

                {user.disputeCount === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                    <History className="w-4 h-4 text-green-600" />
                    <span className="text-[9px] font-black text-green-700 uppercase">Clean Dispute History</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white rounded-3xl p-1.5 h-16 w-full lg:w-fit shadow-xl">
                <TabsTrigger value="active" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs">Inventory</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-2xl px-10 h-full data-[state=active]:bg-[#225BC3] data-[state=active]:text-white font-black uppercase text-xs">Trust Record ({reviews?.length || 0})</TabsTrigger>
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
                        sellerTransactions={user.transactionsCompleted}
                        sellerReliability={user.reliabilityScore}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-slate-100">
                    <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="font-black text-[#225BC3] uppercase tracking-widest">No Public Listings</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-10 space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 mb-8 border-l-8 border-[#225BC3]">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center md:text-left space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Rating</p>
                      <h4 className="text-5xl font-black text-[#225BC3]">4.9 <span className="text-lg text-slate-300">/ 5</span></h4>
                    </div>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Speed</p>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#225BC3] w-[95%]" /></div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Condition</p>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#225BC3] w-[98%]" /></div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Service</p>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#225BC3] w-[92%]" /></div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Honesty</p>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#225BC3] w-[100%]" /></div>
                       </div>
                    </div>
                  </div>
                </Card>

                {isReviewsLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#225BC3]" />
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id} className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 group hover:ring-2 hover:ring-[#225BC3]/5 transition-all">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-4 h-4", i < review.rating ? "text-[#FF8C00] fill-current" : "text-slate-100")} />
                              ))}
                              <Badge className="bg-[#225BC3]/10 text-[#225BC3] font-black text-[8px] uppercase px-2 py-0.5 border-none">Verified Purchase</Badge>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="text-slate-700 font-medium leading-relaxed italic text-lg">
                            "{review.comment}"
                          </p>

                          <div className="pt-4 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                                 <AvatarFallback className="bg-[#225BC3] text-white text-[10px] font-black">{review.buyerName?.[0] || "B"}</AvatarFallback>
                               </Avatar>
                               <div>
                                 <p className="text-xs font-black text-slate-900 leading-none">{review.buyerName || "Trusted Trader"}</p>
                                 <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">Item: {review.listingTitle || "Marketplace Deal"}</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-widest">
                               <ShieldCheck className="w-3 h-3" /> FICA Cleared
                             </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-slate-100">
                    <Quote className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="font-black text-[#225BC3] uppercase tracking-widest">Building History...</p>
                    <p className="text-muted-foreground text-xs mt-2">No transaction reviews recorded yet.</p>
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
