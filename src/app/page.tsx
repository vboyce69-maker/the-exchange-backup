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
  Fingerprint
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
    <div className="depth-bg min-h-screen">
      {/* Background Decor Layer 1 */}
      <div className="light-orb bg-primary w-[500px] h-[500px] -top-40 -left-20" />
      <div className="light-orb bg-secondary w-[400px] h-[400px] top-1/2 -right-20" />
      <div className="light-orb bg-accent w-[300px] h-[300px] bottom-0 left-1/3" />
      
      <Navigation />

      <main className="container mx-auto px-4 py-8 lg:py-16 relative z-10">
        
        {/* Layer 2: Main Glass Chassis */}
        <div className="glass-chassis rounded-[3rem] lg:rounded-[5rem] p-8 lg:p-20 space-y-24 overflow-hidden">
          
          {/* Founding Member Pulse */}
          <div className="flex justify-center -mt-10 lg:-mt-12 mb-10">
            <Badge className="bg-primary/90 text-white font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] text-[10px] shadow-2xl animate-pulse backdrop-blur-xl border border-white/20">
              {slotsLeft} Founding Slots Remaining
            </Badge>
          </div>

          {/* Hero Content Layer 3 */}
          <section className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-up">
              <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">South Africa's Trust Tier</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
                Premium Trade <br />
                <span className="text-primary italic">Decoupled</span> from Risk.
              </h1>
              
              <p className="text-xl text-slate-600 font-medium max-w-lg leading-relaxed">
                Experience a marketplace where every identity is verified and every payment is held until you confirm delivery.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/search">
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                    Explore Market
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/40 bg-white/40 backdrop-blur-md font-black text-slate-900 shadow-xl hover:bg-white/60 transition-all">
                    Get Verified
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-10 pt-10 border-t border-slate-900/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-xs text-slate-900 uppercase">Protected Pay</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Bank-Grade Escrow</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-xl">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-xs text-slate-900 uppercase">Biometric ID</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">4-Pillar Verification</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="bg-white/80 backdrop-blur-3xl p-8 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-white relative z-20 animate-fade-up">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-primary/10 rounded-2xl overflow-hidden shadow-inner">
                          <img src="https://picsum.photos/seed/user99/200/200" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="font-black text-sm text-slate-900 uppercase tracking-tight">Thabo Molefe</p>
                          <Badge className="bg-green-100 text-green-700 uppercase text-[8px] font-black border-none px-2 py-0.5">Verified Pro</Badge>
                       </div>
                    </div>
                    <StarRating value={4.9} />
                 </div>
                 <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-6 shadow-2xl border-4 border-white">
                    <img src="https://picsum.photos/seed/camera-hero/800/600" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Auction</p>
                       <p className="font-black text-2xl text-slate-900 tracking-tighter uppercase">Sony Alpha A7 IV</p>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-3xl text-primary leading-none">R 42,900</p>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Highest Bid</span>
                    </div>
                 </div>
              </div>
              {/* Floating Accent */}
              <div className="absolute -bottom-10 -left-10 bg-accent p-6 rounded-[2.5rem] shadow-2xl text-white max-w-[240px] z-30 animate-bounce">
                <div className="flex items-center gap-2 mb-2">
                   <Zap className="w-4 h-4 fill-current" />
                   <p className="font-black uppercase text-[9px] tracking-widest">Ending Soon</p>
                </div>
                <p className="font-black text-lg leading-tight uppercase">High-End Lot</p>
                <div className="mt-4 flex justify-between items-center">
                   <span className="text-white/80 font-bold text-[10px] uppercase"><Clock className="w-3 h-3 inline mr-1" /> 14m</span>
                   <Button size="sm" className="bg-white text-accent rounded-xl font-black h-8 px-4 text-[10px] uppercase shadow-lg">Bid</Button>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Layer 3 */}
          <section className="space-y-12">
            <div className="flex flex-col items-center text-center space-y-3">
              <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-[0.3em] text-[9px] px-4 py-1">Discover Hierarchy</Badge>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Market Segments</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.name} href={`/search?category=${cat.name.toLowerCase()}`} className="group">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white flex flex-col items-center gap-5 group-hover:scale-105 group-hover:bg-white transition-all duration-500">
                      <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500", cat.bg)}>
                        <Icon className={cn("w-10 h-10", cat.color)} />
                      </div>
                      <span className="text-[11px] font-black uppercase text-slate-900 tracking-widest leading-none">{cat.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Search Glass Block */}
          <section className="bg-slate-900/5 backdrop-blur-3xl p-10 lg:p-14 rounded-[4rem] border border-white/40 flex flex-col lg:flex-row items-center gap-8 shadow-inner">
            <div className="flex-1 w-full space-y-3">
               <div className="flex items-center gap-2 text-primary ml-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Geo-Targeting</span>
               </div>
               <Select defaultValue="jhb">
                  <SelectTrigger className="w-full h-16 rounded-3xl bg-white border-none font-black text-slate-900 shadow-xl text-lg px-8">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[2rem] border-none shadow-2xl p-2">
                     <SelectItem value="jhb" className="font-black uppercase text-xs p-4 rounded-2xl">Johannesburg, GP</SelectItem>
                     <SelectItem value="cpt" className="font-black uppercase text-xs p-4 rounded-2xl">Cape Town, WC</SelectItem>
                     <SelectItem value="dbn" className="font-black uppercase text-xs p-4 rounded-2xl">Durban, KZN</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <div className="flex-1 w-full space-y-3">
               <div className="flex items-center gap-2 text-primary ml-2">
                  <Search className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Deep Search</span>
               </div>
               <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Search premium inventory..." 
                    className="w-full h-16 pl-8 pr-40 rounded-3xl bg-white border-none outline-none font-bold text-lg shadow-xl focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <Button className="absolute right-2 top-2 h-12 px-8 rounded-2xl bg-primary text-white font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Execute Search</Button>
               </div>
            </div>
          </section>

          {/* Trending Deals */}
          <section className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center text-white shadow-2xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Market Flow</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Active Trading Velocity</p>
                </div>
              </div>
              <Link href="/search">
                <Button variant="ghost" className="h-12 rounded-2xl font-black text-primary gap-2 group uppercase text-[10px] tracking-widest hover:bg-primary/5">
                  View Full Registry <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            {!hasMounted || isLoading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
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
              <div className="text-center py-32 bg-white/60 backdrop-blur-md rounded-[4rem] shadow-inner border-2 border-dashed border-slate-200">
                 <Package className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                 <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Registry Empty</p>
              </div>
            )}
          </section>

          {/* Safety Glass CTA */}
          <section>
            <div className="bg-slate-900 rounded-[4rem] p-12 lg:p-24 text-white relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
               <div className="absolute -right-40 -bottom-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/grid/1000/1000')] opacity-5 mix-blend-overlay" />
               
               <div className="max-w-3xl relative z-10 space-y-10 text-center lg:text-left">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/20 mx-auto lg:mx-0 shadow-2xl">
                     <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-5xl lg:text-7xl font-black leading-[0.95] tracking-tighter uppercase">The Standard of <br /><span className="text-primary italic">Verified Trade.</span></h2>
                  <p className="text-xl text-white/60 font-medium leading-relaxed">
                    We've eliminated the 'Wild West' of peer-to-peer commerce. Join the elite network of South African traders today.
                  </p>
                  <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-6">
                     <Link href="/verify">
                       <Button className="h-20 px-14 rounded-3xl bg-primary text-white font-black text-xl shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter">
                         Get Your Badge
                       </Button>
                     </Link>
                     <Link href="/legal">
                       <Button variant="ghost" className="h-20 px-12 rounded-3xl text-white/80 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs border border-white/10 backdrop-blur-md">
                         Safety Protocols
                       </Button>
                     </Link>
                  </div>
               </div>
            </div>
          </section>
        </div>
        
        {/* Spatial Footer */}
        <div className="py-20 text-center space-y-6 opacity-30 group hover:opacity-100 transition-opacity duration-700">
           <div className="flex items-center justify-center gap-10">
              <img src="https://picsum.photos/seed/saps/100/100" className="h-10 grayscale invert brightness-200" />
              <img src="https://picsum.photos/seed/fintech/100/100" className="h-10 grayscale invert brightness-200" />
              <img src="https://picsum.photos/seed/fica/100/100" className="h-10 grayscale invert brightness-200" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">The Exchange Marketplace &copy; 2026</p>
        </div>
      </main>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20">
      <Zap className="w-3.5 h-3.5 text-accent fill-current" />
      <span className="text-xs font-black text-slate-900">{value}</span>
    </div>
  );
}
