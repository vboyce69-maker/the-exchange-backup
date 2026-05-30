"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Car, 
  Smartphone, 
  Home, 
  Watch, 
  Bike, 
  Camera, 
  MapPin, 
  Search,
  ArrowRight,
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
  Gift,
  Rocket,
  Lock,
  ChevronRight,
  ShieldAlert,
  Fingerprint
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, getCountFromServer } from "firebase/firestore";
import { MARKET_CONFIG } from "@/app/lib/market-config";

const CATEGORIES = [
  { name: "Vehicles", icon: Car, color: "text-white", bg: "bg-gradient-to-br from-blue-500 to-blue-700" },
  { name: "Electronics", icon: Smartphone, color: "text-white", bg: "bg-gradient-to-br from-purple-500 to-purple-700" },
  { name: "Real Estate", icon: Home, color: "text-white", bg: "bg-gradient-to-br from-emerald-500 to-emerald-700" },
  { name: "Clothing", icon: Shirt, color: "text-white", bg: "bg-gradient-to-br from-pink-500 to-pink-700" },
  { name: "Sneakers", icon: Footprints, color: "text-white", bg: "bg-gradient-to-br from-orange-500 to-orange-700" },
  { name: "Gaming", icon: Gamepad2, color: "text-white", bg: "bg-gradient-to-br from-indigo-500 to-indigo-700" },
  { name: "Art", icon: Palette, color: "text-white", bg: "bg-gradient-to-br from-rose-500 to-rose-700" },
  { name: "Jewelry", icon: Watch, color: "text-white", bg: "bg-gradient-to-br from-amber-500 to-amber-700" },
  { name: "Sports", icon: Bike, color: "text-white", bg: "bg-gradient-to-br from-cyan-500 to-cyan-700" },
  { name: "Cameras", icon: Camera, color: "text-white", bg: "bg-gradient-to-br from-red-500 to-red-700" },
];

export default function LandingPage() {
  const router = useRouter();
  const [filledCount, setFilledCount] = useState(MARKET_CONFIG.SIMULATED_FILLED_SLOTS);
  const [hasMounted, setHasMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    setHasMounted(true);
    async function fetchUserCount() {
      if (!db) return;
      try {
        const coll = collection(db, "userProfiles");
        const snapshot = await getCountFromServer(coll);
        setFilledCount(snapshot.data().count);
      } catch (err) {
        console.error("Failed to fetch founding member count", err);
      }
    }
    fetchUserCount();
  }, [db]);

  const slotsLeft = Math.max(0, MARKET_CONFIG.FOUNDING_LIMIT - filledCount);

  const trendingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "publicListings"),
      orderBy("postedDate", "desc"),
      limit(8)
    );
  }, [db]);

  const { data: listings, isLoading } = useCollection(trendingQuery);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      
      {/* Founding 1000 Bar */}
      <div className="bg-primary py-2 px-4 text-center">
        <p className="text-[10px] font-black uppercase text-white tracking-widest">
          Limited: Join the Founding 1000 Sellers — <span className="bg-accent text-white px-2 py-0.5 rounded ml-1">{slotsLeft} Slots Left</span>
        </p>
      </div>

      {/* Hero Section - PREMIUM 2-COLUMN */}
      <section className="relative pt-12 lg:pt-20 pb-24 overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/10">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">South Africa's High-Trust Market</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tighter">
              Trade with <br />
              <span className="text-primary italic">Absolute</span> Confidence.
            </h1>
            
            <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
              Every seller is verified. Every payment is protected. No scams, just legitimate deals in the local community.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/search">
                <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white font-extrabold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                  Browse Market
                </Button>
              </Link>
              <Link href="/verify">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm hover:bg-slate-50">
                  Seller Verification
                </Button>
              </Link>
            </div>

            {/* Trust Strip */}
            <div className="flex items-center gap-8 pt-10 border-t border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-slate-900 uppercase">Protected Hold</p>
                    <p className="text-[10px] text-slate-500 font-medium">Safe Escrow System</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-slate-900 uppercase">Verified ID</p>
                    <p className="text-[10px] text-slate-500 font-medium">Biometric KYC</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="hidden lg:block relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            <div className="relative z-10 space-y-6">
               <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100/50 max-w-[400px] ml-auto animate-fade-up delay-100">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden">
                        <img src="https://picsum.photos/seed/user1/200/200" className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <p className="font-extrabold text-sm text-slate-900">David Mbeki</p>
                        <Badge className="bg-green-100 text-green-700 uppercase text-[8px] font-black border-none">Verified Pro</Badge>
                     </div>
                  </div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                     <img src="https://picsum.photos/seed/product/400/300" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-between items-center">
                     <p className="font-extrabold text-lg text-slate-900">MacBook Pro M3</p>
                     <p className="font-black text-primary text-xl">R 32,500</p>
                  </div>
               </div>
               
               <div className="bg-accent p-6 rounded-[2.5rem] shadow-2xl text-white max-w-[320px] -mt-12 animate-fade-up delay-300">
                  <div className="flex items-center gap-3 mb-2">
                     <Zap className="w-5 h-5 fill-current" />
                     <p className="font-black uppercase text-[10px] tracking-widest">Trending Auction</p>
                  </div>
                  <p className="font-extrabold text-2xl mb-4 leading-tight">Elite Cycling Gear</p>
                  <div className="flex justify-between items-center">
                     <span className="text-white/80 font-bold text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> 2h 14m left</span>
                     <Button size="sm" className="bg-white text-accent rounded-xl h-9 px-4 font-black">Bid Now</Button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 pb-24 space-y-24">
        {/* Categories Grid - PREMIUM STYLE */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tighter">Explore Categories</h2>
            <p className="text-slate-500 font-medium">Fast, organized browsing across all verticals</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.name} 
                  href={`/search?category=${cat.name.toLowerCase()}`}
                  className="group"
                >
                  <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100/50 flex flex-col items-center gap-4 group-hover:shadow-premium-hover group-hover:-translate-y-1 transition-all duration-300">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300", cat.bg)}>
                      <Icon className={cn("w-8 h-8", cat.color)} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest leading-none">{cat.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Search Bar - TAKEALOT STYLE */}
        <section className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100/50 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full space-y-3">
             <div className="flex items-center gap-2 text-primary">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Regional Discovery</span>
             </div>
             <Select defaultValue="jhb">
                <SelectTrigger className="w-full h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-700">
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                   <SelectItem value="jhb" className="font-bold">Johannesburg, GP</SelectItem>
                   <SelectItem value="cpt" className="font-bold">Cape Town, WC</SelectItem>
                   <SelectItem value="dbn" className="font-bold">Durban, KZN</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <div className="flex-1 w-full space-y-3">
             <div className="flex items-center gap-2 text-primary">
                <Search className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Keyword Search</span>
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="What are you looking for today?" 
                  className="w-full h-14 pl-6 pr-32 rounded-2xl bg-slate-50 border-none outline-none font-medium shadow-inner"
                />
                <Button className="absolute right-1.5 top-1.5 h-11 px-6 rounded-xl bg-primary text-white font-extrabold uppercase text-[10px] tracking-widest">Search</Button>
             </div>
          </div>
        </section>

        {/* Trending Deals */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter uppercase leading-none">Trending Now</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">High-demand items from top sellers</p>
              </div>
            </div>
            <Link href="/search">
              <Button variant="ghost" className="h-10 rounded-xl font-extrabold text-primary gap-2 group uppercase text-xs">
                View All Market <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {!hasMounted || isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {listings.map((listing) => (
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
                  isBoosted={listing.isBoosted}
                  isAuction={listing.isAuction}
                  isBulk={listing.isBulk}
                  quantity={listing.quantity}
                  auctionEndDate={listing.auctionEndDate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-slate-200">
               <Package className="w-16 h-16 text-slate-100 mx-auto mb-4" />
               <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Market is refreshing...</p>
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section>
          <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
             
             <div className="max-w-2xl relative z-10 space-y-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                   <ShieldCheck className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold leading-none tracking-tighter">Verified Sellers. <br /><span className="text-primary italic">Zero Friction.</span></h2>
                <p className="text-lg text-white/60 font-medium leading-relaxed">
                  Join the first marketplace designed to eliminate commerce fraud in South Africa. Get your "Verified Badge" today.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                   <Link href="/verify">
                     <Button className="h-16 px-10 rounded-2xl bg-primary text-white font-extrabold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                       Get Verified Badge
                     </Button>
                   </Link>
                   <Link href="/legal">
                     <Button variant="ghost" className="h-16 px-10 rounded-2xl text-white/80 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs">
                       Safety Center
                     </Button>
                   </Link>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
