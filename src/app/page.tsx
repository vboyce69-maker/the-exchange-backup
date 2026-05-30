
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Smartphone, 
  Home, 
  Watch, 
  Bike, 
  Camera, 
  MapPin, 
  Search,
  TrendingUp,
  Clock,
  Shirt,
  Footprints,
  ShieldCheck,
  Loader2,
  Package,
  Zap,
  Gamepad2,
  Palette,
  Lock,
  ChevronRight,
  Fingerprint,
  Star,
  History
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CATEGORIES = [
  { name: "Vehicles", icon: Car, bg: "from-blue-500 to-blue-600" },
  { name: "Electronics", icon: Smartphone, bg: "from-purple-500 to-purple-600" },
  { name: "Real Estate", icon: Home, bg: "from-emerald-500 to-emerald-600" },
  { name: "Clothing", icon: Shirt, bg: "from-pink-500 to-pink-600" },
  { name: "Sneakers", icon: Footprints, bg: "from-orange-500 to-orange-600" },
  { name: "Gaming", icon: Gamepad2, bg: "from-indigo-500 to-indigo-600" },
  { name: "Art", icon: Palette, bg: "from-rose-500 to-rose-600" },
  { name: "Jewelry", icon: Watch, bg: "from-amber-500 to-amber-600" },
  { name: "Sports", icon: Bike, bg: "from-cyan-500 to-cyan-600" },
  { name: "Photography", icon: Camera, bg: "from-red-500 to-red-600" },
];

export default function LandingPage() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const trendingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "publicListings"),
      orderBy("postedDate", "desc"),
      limit(20)
    );
  }, [db]);

  const { data: rawListings, isLoading } = useCollection(trendingQuery);

  const boostedListings = useMemo(() => {
    if (!rawListings) return [];
    return rawListings.filter(l => l.isBoosted).sort((a, b) => new Date(b.boostedAt || 0).getTime() - new Date(a.boostedAt || 0).getTime());
  }, [rawListings]);

  const trendingListings = useMemo(() => {
    if (!rawListings) return [];
    return [...rawListings].sort((a, b) => {
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }).slice(0, 4);
  }, [rawListings]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        
        <div className="space-y-24">
          
          {/* Hero Section */}
          <section className="grid lg:grid-cols-2 gap-16 items-start pt-8">
            <div className="space-y-10 animate-fade-up">
              <div className="inline-flex items-center gap-3 bg-white px-6 py-2.5 rounded-full border border-slate-100 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">South Africa's High-Trust Market</span>
              </div>
              
              <h1 className="text-6xl lg:text-[5.5rem] font-black text-slate-900 leading-[0.9] tracking-tighter">
                Trade with <br />
                <span className="text-primary italic font-serif">Absolute</span> <br />
                Confidence.
              </h1>
              
              <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                Every seller is verified. Every payment is protected. <br />
                No scams, just legitimate deals in the local community.
              </p>

              <div className="flex flex-wrap gap-5 pt-4">
                <Link href="/search">
                  <Button size="lg" className="h-[72px] px-12 rounded-[1.5rem] bg-primary text-white font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    Browse Market
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button size="lg" variant="outline" className="h-[72px] px-10 rounded-[1.5rem] border-slate-200 bg-white font-black text-slate-600 shadow-lg hover:bg-slate-50 transition-all text-xl">
                    Seller Verification
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Boosted Slideshow */}
            <div className="hidden lg:block space-y-6">
              {boostedListings.length > 0 ? (
                <Carousel className="w-full" opts={{ loop: true }}>
                  <CarouselContent>
                    {boostedListings.map((listing) => (
                      <CarouselItem key={listing.id}>
                        <div className="bg-white p-8 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-50 relative z-20 transition-all">
                          <Link href={`/profile/${listing.sellerId}`} className="block mb-6 group/seller hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-16 h-16 bg-slate-100 rounded-[1.2rem] overflow-hidden border-2 border-white shadow-md group-hover/seller:ring-2 group-hover/seller:ring-primary transition-all">
                                   <img src={`https://picsum.photos/seed/${listing.sellerId}/200/200`} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <div className="flex items-center gap-2">
                                     <p className="font-black text-lg text-slate-900 uppercase tracking-tight group-hover/seller:text-primary transition-colors">Verified Pro</p>
                                     <VerifiedBadge />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Trust Verified Identity</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-5">
                               <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                     <Star className="w-2.5 h-2.5 text-[#FF8C00] fill-current" /> Rating
                                  </p>
                                  <p className="text-sm font-black text-slate-900">4.9 / 5.0</p>
                               </div>
                               <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                     <TrendingUp className="w-2.5 h-2.5 text-primary" /> Reliability
                                  </p>
                                  <p className="text-sm font-black text-slate-900">{listing.trustScore || 90}% Score</p>
                               </div>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                               <p className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                                  <Fingerprint className="w-3 h-3" /> Trust Engine Analysis
                               </p>
                               <div className="flex flex-wrap gap-x-4 gap-y-2">
                                  <div className="flex items-center gap-1.5">
                                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                     <span className="text-[8px] font-bold text-slate-600 uppercase">Biometric Match</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                     <span className="text-[8px] font-bold text-slate-600 uppercase">FICA Validated</span>
                                  </div>
                               </div>
                            </div>
                          </Link>

                          <Link href={`/listings/${listing.id}`} className="block group/product">
                            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-8 shadow-2xl border-4 border-white group-hover/product:scale-[1.02] transition-transform duration-500">
                                <img src={listing.imageUrls?.[0] || "https://picsum.photos/seed/product/800/600"} className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4">
                                   <Badge className="bg-accent text-white border-none shadow-lg font-black text-[10px] uppercase px-4 py-1.5 rounded-xl animate-pulse">
                                      <Zap className="w-3 h-3 mr-1.5 fill-current" /> Premium Boost
                                   </Badge>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                   <p className="font-black text-2xl text-slate-900 tracking-tight group-hover/product:text-primary transition-colors truncate max-w-[200px] uppercase">{listing.title}</p>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{listing.isBulk ? 'Bulk Lot' : 'Premium Item'}</p>
                                </div>
                                <p className="font-black text-4xl text-primary leading-none tracking-tighter">R {listing.price?.toLocaleString()}</p>
                            </div>
                          </Link>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-2 mt-6">
                    <CarouselPrevious className="static translate-y-0 h-10 w-10 bg-white border-none shadow-md hover:bg-slate-50" />
                    <CarouselNext className="static translate-y-0 h-10 w-10 bg-white border-none shadow-md hover:bg-slate-50" />
                  </div>
                </Carousel>
              ) : (
                /* Fallback if no items are boosted yet */
                <div className="bg-white p-12 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-50 relative z-20 flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-primary shadow-inner">
                    <Zap className="w-12 h-12 animate-pulse fill-current" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Boost Your Inventory</h3>
                    <p className="text-slate-400 font-medium text-sm">Become a Founding Member and push your listings to the spotlight.</p>
                  </div>
                  <Link href="/verify">
                    <Button className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">
                      Get Verified Status
                    </Button>
                  </Link>
                </div>
              )}

              <div className="animate-fade-up [animation-delay:200ms]">
                <div className="bg-[#FF8C00] p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-6 group hover:scale-[1.02] transition-all duration-300">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                         <Zap className="w-7 h-7 text-white fill-current animate-bounce" />
                      </div>
                      <div>
                         <p className="text-white font-black uppercase text-xs tracking-widest leading-none">Trending Auction</p>
                         <p className="text-white/80 text-[10px] font-bold uppercase mt-1.5 tracking-tight">Active bidding on high-value lots</p>
                      </div>
                   </div>
                   <Link href="/auctions">
                     <Button className="bg-white text-[#FF8C00] font-black h-12 px-8 rounded-2xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-xs uppercase tracking-widest">
                        View Bids
                     </Button>
                   </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="space-y-12">
            <div className="flex flex-col items-center text-center space-y-3">
              <Badge variant="outline" className="border-slate-200 text-slate-400 font-black uppercase tracking-[0.3em] text-[9px] px-4 py-1">Discovery Core</Badge>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Market Segments</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.name} href={`/search?category=${cat.name.toLowerCase()}`} className="group text-center space-y-5">
                    <div className="w-[88px] h-[88px] mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br", cat.bg)}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <span className="block text-[11px] font-black uppercase text-slate-600 tracking-widest transition-colors group-hover:text-primary">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Trending Deals */}
          <section className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Hottest Listings</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Active Trading Velocity</p>
              </div>
              <Link href="/search">
                <Button variant="ghost" className="h-12 rounded-2xl font-black text-primary gap-2 group uppercase text-[10px] tracking-widest hover:bg-slate-50">
                  Browse Everything <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            {!hasMounted || isLoading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
              </div>
            ) : trendingListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                {trendingListings.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    id={listing.id}
                    title={listing.title}
                    price={listing.price}
                    location={listing.location || "Local"}
                    imageUrl={listing.imageUrls?.[0]}
                    sellerName="Verified Seller"
                    sellerRating={4.9}
                    isVerified={true}
                    isAuction={listing.isAuction}
                    isBulk={listing.isBulk}
                    isBoosted={listing.isBoosted}
                    quantity={listing.quantity}
                    auctionEndDate={listing.auctionEndDate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                 <Package className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                 <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Registry Empty</p>
              </div>
            )}
          </section>

          {/* Footer Trust Shield */}
          <section>
            <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-16 text-white relative overflow-hidden">
               <div className="absolute -right-40 -bottom-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
               
               <div className="max-w-2xl relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                     <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-black leading-[0.95] tracking-tighter uppercase">Shop with total <br /><span className="text-primary italic">Confidence.</span></h2>
                  <p className="text-lg text-white/60 font-medium leading-relaxed max-w-xl">
                    Every trade is protected by our biometric verification and secure escrow protocol. We've eliminated the risk so you can focus on the deal.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                     <Link href="/verify">
                       <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter">
                         Get Verified Badge
                       </Button>
                     </Link>
                     <Link href="/legal">
                       <Button variant="ghost" className="h-14 px-8 rounded-2xl text-white/80 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] border border-white/10 backdrop-blur-md">
                         Safety Center
                       </Button>
                     </Link>
                  </div>
               </div>
            </div>
          </section>
        </div>
        
        <div className="py-20 text-center opacity-30 group hover:opacity-100 transition-opacity duration-700">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">The Exchange Marketplace &copy; 2026</p>
        </div>
      </main>
    </div>
  );
}
