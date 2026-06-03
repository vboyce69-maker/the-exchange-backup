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
  ShieldCheck,
  Loader2,
  Package,
  Zap,
  Lock,
  ChevronRight,
  Fingerprint,
  Star,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
  useDoc,
} from "@/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  doc,
} from "firebase/firestore";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Standard Categories with RSA Market Context
const CATEGORIES = [
  { name: "Vehicles", icon: Car, bg: "from-blue-500 to-blue-600" },
  { name: "Electronics", icon: Smartphone, bg: "from-cyan-400 to-cyan-500" },
  { name: "Fashion", icon: Shirt, bg: "from-pink-500 to-pink-600" },
  { name: "Property", icon: Home, bg: "from-indigo-500 to-indigo-600" },
  { name: "Collectibles", icon: Star, bg: "from-orange-500 to-orange-600" },
];

export default function LandingPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "userProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);
  const isVerified = profile?.kycStatus === "verified";

  const trendingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "publicListings"),
      orderBy("postedDate", "desc"),
      limit(20),
    );
  }, [db]);

  const { data: rawListings, isLoading } = useCollection(trendingQuery);

  const boostedListings = useMemo(() => {
    if (!rawListings) return [];
    return rawListings
      .filter((l) => l.isBoosted)
      .sort(
        (a, b) =>
          new Date(b.boostedAt || 0).getTime() -
          new Date(a.boostedAt || 0).getTime(),
      );
  }, [rawListings]);

  const trendingListings = useMemo(() => {
    if (!rawListings) return [];
    return [...rawListings]
      .sort((a, b) => {
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;
        return (
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
      })
      .slice(0, 4);
  }, [rawListings]);

  return (
    <div className="min-h-screen bg-[#F0F7FF] relative overflow-hidden">
      {/* Decorative Atmospheric Blobs for Glassmorphism */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed top-[40%] right-[10%] w-[30%] h-[30%] bg-[#FF8C00]/5 rounded-full blur-[100px] pointer-events-none" />

      <Navigation />

      <main className="container mx-auto px-4 pt-4 pb-8 lg:pt-6 lg:pb-12 relative z-10">
        <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] lg:rounded-[4rem] border border-white/20 shadow-2xl p-6 lg:p-16 space-y-12 lg:space-y-24">
          {/* Hero Section */}
          <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start pt-0">
            <div className="space-y-6 lg:space-y-10 animate-fade-up">
              <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                  South Africa's High-Trust Market
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                Trade with <br />
                <span className="text-primary italic">Absolute</span> <br />
                Confidence.
              </h1>

              <p className="text-base lg:text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                Every seller is verified. Every payment is protected. <br className="hidden sm:block" />
                No scams, just legitimate deals in the local community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/search" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 lg:h-18 px-10 lg:px-12 rounded-[1.2rem] lg:rounded-[1.5rem] bg-primary text-white font-black text-base lg:text-lg shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Browse Market
                  </Button>
                </Link>
                <Link href={isVerified ? "/create" : "/verify"} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 lg:h-18 px-8 lg:px-10 rounded-[1.2rem] lg:rounded-[1.5rem] border-white/30 bg-white/30 backdrop-blur-md font-black text-slate-600 shadow-lg hover:bg-white/50 transition-all text-base lg:text-lg"
                  >
                    {isVerified ? "Post an Item" : "Seller Verification"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Boosted Slideshow */}
            <div className="block space-y-6 mt-4 lg:mt-0">
              {boostedListings.length > 0 ? (
                <Carousel className="w-full" opts={{ loop: true }}>
                  <CarouselContent>
                    {boostedListings.map((listing) => (
                      <CarouselItem key={listing.id}>
                        <div className="bg-white/60 backdrop-blur-md p-5 lg:p-8 rounded-[2.2rem] lg:rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-white/30 relative z-20 transition-all">
                          <Link
                            href={`/profile/${listing.sellerId}`}
                            className="block mb-4 lg:mb-6 group/seller hover:opacity-100 transition-opacity"
                          >
                            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-5">
                              <div className="w-10 h-10 lg:w-16 lg:h-16 bg-white rounded-2xl lg:rounded-[1.2rem] overflow-hidden border-2 border-white shadow-md group-hover/seller:ring-2 group-hover/seller:ring-primary transition-all">
                                <img
                                  src={`https://picsum.photos/seed/${listing.sellerId}/200/200`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 lg:gap-2">
                                  <p className="font-black text-sm lg:text-lg text-slate-900 uppercase tracking-tight group-hover/seller:text-primary transition-colors">
                                    Verified Pro
                                  </p>
                                  <VerifiedBadge />
                                </div>
                                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 lg:mt-1">
                                  Trust Verified Identity
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-4 lg:mb-5">
                              <div className="p-2.5 lg:p-3 bg-white/40 rounded-xl lg:rounded-2xl border border-white/20 space-y-1">
                                <p className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Star className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-[#FF8C00] fill-current" />{" "}
                                  Rating
                                </p>
                                <p className="text-[10px] lg:text-sm font-black text-slate-900">
                                  4.9 / 5.0
                                </p>
                              </div>
                              <div className="p-2.5 lg:p-3 bg-white/40 rounded-xl lg:rounded-2xl border border-white/20 space-y-1">
                                <p className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <TrendingUp className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-primary" />{" "}
                                  Reliability
                                </p>
                                <p className="text-[10px] lg:text-sm font-black text-slate-900">
                                  {listing.trustScore || 90}% Score
                                </p>
                              </div>
                            </div>

                            <div className="p-3 lg:p-4 bg-primary/10 rounded-2xl border border-primary/20 space-y-1.5 lg:space-y-2">
                              <p className="text-[7px] lg:text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                                <Fingerprint className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> Trust Engine
                                Analysis
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1.5 lg:gap-x-4 lg:gap-y-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                                  <span className="text-[7px] lg:text-[8px] font-bold text-slate-600 uppercase">
                                    Biometric Match
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                                  <span className="text-[7px] lg:text-[8px] font-bold text-slate-600 uppercase">
                                    FICA Validated
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>

                          <Link
                            href={`/listings/${listing.id}`}
                            className="block group/product"
                          >
                            <div className="relative aspect-[16/10] rounded-2xl lg:rounded-3xl overflow-hidden mb-4 lg:mb-8 shadow-xl border-2 lg:border-4 border-white group-hover/product:scale-[1.02] transition-transform duration-500">
                              <img
                                src={
                                  listing.imageUrls?.[0] ||
                                  "https://picsum.photos/seed/product/800/600"
                                }
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 lg:top-4 lg:left-4">
                                <Badge className="bg-accent text-white border-none shadow-lg font-black text-[7px] lg:text-[10px] uppercase px-2 py-1 lg:px-4 lg:py-1.5 rounded-lg lg:rounded-xl animate-pulse">
                                  <Zap className="w-2 h-2 lg:w-3 lg:h-3 mr-1 lg:mr-1.5 fill-current" />{" "}
                                  Featured
                                </Badge>
                              </div>
                            </div>
                            <div className="flex justify-between items-end gap-4">
                              <div className="min-w-0 flex-1">
                                <p className="font-black text-lg lg:text-2xl text-slate-900 tracking-tight group-hover/product:text-primary transition-colors truncate uppercase">
                                  {listing.title}
                                </p>
                                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 lg:mt-1">
                                  {listing.isBulk ? "Bulk Lot" : "Premium Item"}
                                </p>
                              </div>
                              <p className="font-black text-2xl lg:text-4xl text-primary leading-none tracking-tighter shrink-0">
                                R {listing.price?.toLocaleString()}
                              </p>
                            </div>
                          </Link>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-2 mt-4 lg:mt-6">
                    <CarouselPrevious className="static translate-y-0 h-9 w-9 lg:h-10 lg:w-10 bg-white/60 backdrop-blur-md border-none shadow-md hover:bg-white" />
                    <CarouselNext className="static translate-y-0 h-9 w-9 lg:h-10 lg:w-10 bg-white/60 backdrop-blur-md border-none shadow-md hover:bg-white" />
                  </div>
                </Carousel>
              ) : (
                /* Fallback if no items are boosted yet */
                <div className="bg-white/60 backdrop-blur-md p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-white/30 relative z-20 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 bg-primary/5 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center text-primary shadow-inner">
                    <Zap className="w-8 h-8 lg:w-12 lg:h-12 animate-pulse fill-current" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg lg:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                      Boost Your Inventory
                    </h3>
                    <p className="text-slate-400 font-medium text-xs lg:text-sm">
                      Become a Founding Member and push your listings to the
                      spotlight.
                    </p>
                  </div>
                  <Link href="/verify">
                    <Button className="h-12 lg:h-14 px-8 lg:px-10 rounded-2xl bg-primary text-white font-black uppercase text-[10px] lg:text-xs tracking-widest shadow-xl shadow-primary/20">
                      Get Verified Status
                    </Button>
                  </Link>
                </div>
              )}

              <div className="animate-fade-up [animation-delay:200ms]">
                <div className="bg-[#FF8C00] p-4 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-4 lg:gap-6 group hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-inner">
                      <Zap className="w-5 h-5 lg:w-7 lg:h-7 text-white fill-current animate-bounce" />
                    </div>
                    <div>
                      <p className="text-white font-black uppercase text-[10px] lg:text-xs tracking-widest leading-none">
                        Live Auction
                      </p>
                      <p className="text-white/80 text-[8px] lg:text-[10px] font-bold uppercase mt-1 tracking-tight">
                        Timed bidding active
                      </p>
                    </div>
                  </div>
                  <Link href="/auctions">
                    <Button className="bg-white text-[#FF8C00] font-black h-9 lg:h-12 px-5 lg:px-8 rounded-xl lg:rounded-2xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-[9px] lg:text-[10px] uppercase tracking-widest">
                      View Bids
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="space-y-8 lg:space-y-12">
            <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
              <Badge
                variant="outline"
                className="border-white/30 text-slate-400 font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] text-[8px] lg:text-[9px] px-3 lg:px-4 py-1"
              >
                Discovery Core
              </Badge>
              <h2 className="text-2xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter">
                Market Segments
              </h2>
            </div>
            <div className="flex md:grid md:grid-cols-5 gap-5 lg:gap-10 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={`/search?category=${cat.name.toLowerCase()}`}
                    className="group text-center space-y-3 lg:space-y-5 flex-shrink-0 w-20 md:w-auto"
                  >
                    <div className="w-16 h-16 lg:w-[88px] lg:h-[88px] mx-auto bg-white/60 backdrop-blur-md rounded-[1.2rem] lg:rounded-[2rem] shadow-lg lg:shadow-xl border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500">
                      <div
                        className={cn(
                          "w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br",
                          cat.bg,
                        )}
                      >
                        <Icon className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                      </div>
                    </div>
                    <span className="block text-[9px] lg:text-[11px] font-black uppercase text-slate-600 tracking-widest transition-colors group-hover:text-primary">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Trending Deals */}
          <section className="space-y-8 lg:space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  Hottest Listings
                </h2>
                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 lg:mt-2">
                  Active Trading Velocity
                </p>
              </div>
              <Link href="/search">
                <Button
                  variant="ghost"
                  className="h-10 lg:h-12 rounded-xl lg:rounded-2xl font-black text-primary gap-2 group uppercase text-[9px] lg:text-[10px] tracking-widest hover:bg-white/50 w-fit"
                >
                  Browse Everything{" "}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {!hasMounted || isLoading ? (
              <div className="flex justify-center py-20 lg:py-32">
                <Loader2 className="w-10 lg:w-16 h-10 lg:h-16 animate-spin text-primary opacity-20" />
              </div>
            ) : trendingListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
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
              <div className="text-center py-20 lg:py-32 bg-white/40 backdrop-blur-md rounded-[2rem] lg:rounded-[3rem] border-2 border-dashed border-white/30">
                <Package className="w-10 lg:w-16 h-10 lg:h-16 text-slate-100 mx-auto mb-4 lg:mb-6" />
                <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] lg:text-xs">
                  Registry Empty
                </p>
              </div>
            )}
          </section>

          {/* Footer Trust Shield */}
          <section className="flex justify-center">
            <div className="w-full max-w-5xl bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
              <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-10 relative z-10">
                <div className="space-y-3 lg:space-y-4 max-w-xl text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 text-primary">
                    <Lock className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em]">
                      Institutional Grade Security
                    </span>
                  </div>
                  <h2 className="text-xl lg:text-4xl font-black leading-none tracking-tighter uppercase">
                    Shop with total <br className="lg:hidden" />
                    <span className="text-primary italic">Confidence.</span>
                  </h2>
                  <p className="text-[10px] lg:text-base text-white/50 font-medium leading-relaxed">
                    Every trade is protected by biometric verification and our
                    proprietary secure escrow protocol. We've eliminated the
                    risk so you can focus on the deal.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full md:w-auto">
                  <Link href="/verify" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-12 lg:h-14 px-8 rounded-2xl bg-primary text-white font-black text-[10px] lg:text-xs shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                      Get Verified
                    </Button>
                  </Link>
                  <Link href="/legal" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto h-12 lg:h-14 px-8 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[8px] lg:text-[9px] border border-white/10 backdrop-blur-md"
                    >
                      Safety Protocol
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="py-12 lg:py-20 text-center opacity-30 group hover:opacity-100 transition-opacity duration-700">
          <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
            The Exchange Marketplace &copy; 2026
          </p>
        </div>
      </main>
    </div>
  );
}
