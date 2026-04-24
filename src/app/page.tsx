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
  Sparkles,
  Zap,
  Gamepad2,
  Palette,
  Gift,
  Rocket
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { MARKET_CONFIG } from "@/app/lib/market-config";

const CATEGORIES = [
  { name: "Vehicles", icon: Car, color: "bg-blue-500", description: "Cars, Trucks & Parts" },
  { name: "Electronics", icon: Smartphone, color: "bg-purple-500", description: "Phones, Laptops & TV" },
  { name: "Real Estate", icon: Home, color: "bg-green-500", description: "Buy, Sell & Rent" },
  { name: "Clothing", icon: Shirt, color: "bg-pink-500", description: "Fashion & Trends" },
  { name: "Sneakers", icon: Footprints, color: "bg-orange-500", description: "Collectibles & Kickz" },
  { name: "Gaming", icon: Gamepad2, color: "bg-indigo-500", description: "Consoles & Games" },
  { name: "Art", icon: Palette, color: "bg-rose-500", description: "Art & Supplies" },
  { name: "Jewelry", icon: Watch, color: "bg-yellow-500", description: "Luxury & Gems" },
  { name: "Sports", icon: Bike, color: "bg-cyan-500", description: "Gear & Equipment" },
  { name: "Photography", icon: Camera, color: "bg-red-500", description: "Cameras & Glass" },
];

const SA_CITIES = [
  { id: "jhb", name: "Johannesburg", province: "GP" },
  { id: "cpt", name: "Cape Town", province: "WC" },
  { id: "dbn", name: "Durban", province: "KZN" },
  { id: "pta", name: "Pretoria", province: "GP" },
  { id: "plz", name: "Gqeberha", province: "EC" },
  { id: "bfn", name: "Bloemfontein", province: "FS" },
  { id: "els", name: "East London", province: "EC" },
  { id: "nlp", name: "Nelspruit", province: "MP" },
  { id: "kim", name: "Kimberley", province: "NC" },
  { id: "pol", name: "Polokwane", province: "LP" },
  { id: "pmb", name: "Pietermaritzburg", province: "KZN" },
  { id: "rtb", name: "Rustenburg", province: "NW" },
];

export default function LandingPage() {
  const router = useRouter();
  const [activeRadius, setActiveRadius] = useState(25);
  const [selectedCity, setSelectedCity] = useState("jhb");
  const [searchQuery, setSearchQuery] = useState("");
  const db = useFirestore();

  const slotsLeft = MARKET_CONFIG.FOUNDING_LIMIT - MARKET_CONFIG.SIMULATED_FILLED_SLOTS;
  const isProgramActive = slotsLeft > 0;

  const trendingQuery = useMemoFirebase(() => {
    return query(
      collection(db, "publicListings"),
      orderBy("postedDate", "desc"),
      limit(8)
    );
  }, [db]);

  const { data: listings, isLoading, error } = useCollection(trendingQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      
      {/* Founding 1000 Promo Banner with Scarcity */}
      <div className={cn(
        "py-2.5 px-6 relative overflow-hidden transition-colors duration-500",
        isProgramActive ? "bg-[#FF8C00] text-white" : "bg-slate-900 text-white"
      )}>
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
           <div className="flex items-center gap-3">
              <Zap className={cn("w-4 h-4", isProgramActive && "animate-pulse")} />
              <p className="font-black uppercase text-[10px] tracking-widest">
                {isProgramActive ? (
                  <>
                    <span className="opacity-80">Join the</span> Founding 1000 Sellers: 
                    <span className="ml-2 font-black bg-white text-[#FF8C00] px-2 py-0.5 rounded-md">{slotsLeft} Slots Remaining</span>
                  </>
                ) : (
                  <>
                    <span className="opacity-80">Founding 1000 Program:</span>
                    <span className="ml-2">Capacity Reached. Standard Fees Apply.</span>
                  </>
                )}
              </p>
           </div>
           {isProgramActive && (
             <Link href="/create">
                <Button size="sm" className="bg-white text-[#FF8C00] font-black rounded-xl hover:bg-slate-50 h-8 px-6 uppercase text-[9px] tracking-widest shadow-xl">
                   Claim Free Slot
                </Button>
             </Link>
           )}
        </div>
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center overflow-hidden bg-[#225BC3]">
        <div className="absolute inset-0 opacity-25">
           <Image 
            src="https://picsum.photos/seed/localbid-hero/1920/1080" 
            alt="Marketplace Hero" 
            fill 
            className="object-cover"
            priority
            data-ai-hint="marketplace trade"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20">
              <Rocket className="w-4 h-4 text-[#34CBED]" />
              <span className="text-[10px] font-black uppercase tracking-widest">South Africa's Trusted Marketplace</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-[1.1] tracking-tighter">
              The smartest way to <span className="text-[#34CBED]">trade locally.</span>
            </h1>
            <p className="text-lg text-white/80 font-black max-w-lg tracking-tight leading-relaxed">
              Verified Sellers, Secure Deals, No Scams, Just Good Trades.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/search">
                <Button size="lg" className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black h-14 px-8 rounded-[1.25rem] text-base shadow-2xl shadow-orange-500/30 hover:scale-105 transition-transform">
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/referrals">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md h-14 px-8 rounded-[1.25rem] text-base font-bold">
                  Refer & Earn <Gift className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block relative aspect-[4/3] group">
             <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] rotate-3 group-hover:rotate-1 transition-transform duration-500" />
             <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border-8 border-white/10 shadow-2xl">
                <Image src="https://picsum.photos/seed/premium-deal/800/600" alt="Premium Listing" fill className="object-cover" data-ai-hint="luxury products" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-6 rounded-[1.5rem] shadow-2xl animate-in slide-in-from-bottom-8">
                   <div className="flex justify-between items-center mb-2">
                     <Badge className="bg-[#225BC3] text-white border-none text-[8px] font-black uppercase">Live Auction</Badge>
                     <span className="text-[9px] font-black text-[#FF8C00] flex items-center gap-1"><Clock className="w-3 h-3" /> 2h 14m left</span>
                   </div>
                   <p className="text-xl font-black text-slate-900 leading-tight">Professional Video Suite</p>
                   <div className="flex items-center justify-between mt-3">
                      <span className="text-2xl font-black text-[#225BC3]">R 42,500</span>
                      <Button size="sm" className="bg-[#34CBED] text-white font-black rounded-xl h-10 px-6">Bid Now</Button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-10">
        {/* Referral Teaser */}
        <section className="mb-12">
           <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border-2 border-[#225BC3]/5 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-sm shrink-0">
                    <Gift className="w-8 h-8" />
                 </div>
                 <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter">Invite friends, get free boosts.</h2>
                    <p className="text-slate-500 font-medium max-w-md text-sm">Unlock a **Free Featured Listing** for every 3 friends who verify their account.</p>
                 </div>
              </div>
              <Link href="/referrals">
                 <Button className="h-14 px-10 rounded-2xl bg-[#225BC3] text-white font-black text-base shadow-xl hover:scale-105 transition-all">
                    Get My Link <ArrowRight className="w-5 h-5 ml-2" />
                 </Button>
              </Link>
           </div>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.name} 
                  href={`/search?category=${cat.name.toLowerCase()}`}
                  className="bg-white p-4 rounded-[1.5rem] shadow-md border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-50 transition-all hover:-translate-y-1 group"
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", cat.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black uppercase text-slate-900 block leading-none">{cat.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col lg:flex-row items-center gap-6 mb-12">
          <div className="flex-1 w-full space-y-3">
            <h3 className="font-black text-[#225BC3] uppercase text-[9px] tracking-[0.2em]">Nearby Discovery</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
               <Select value={selectedCity} onValueChange={setSelectedCity}>
                 <SelectTrigger className="w-full sm:w-64 h-12 px-6 rounded-2xl bg-slate-50 border-none font-bold text-sm text-slate-700 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#225BC3]" />
                    <SelectValue placeholder="Select City" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {SA_CITIES.map((city) => (
                      <SelectItem key={city.id} value={city.id} className="font-bold text-slate-700 rounded-xl">
                        {city.name}, {city.province}
                      </SelectItem>
                    ))}
                 </SelectContent>
               </Select>
               <div className="flex flex-1 bg-slate-100 p-1 rounded-2xl h-12 w-full">
                  {[5, 10, 25, 50, 100].map(r => (
                     <button 
                      key={r} 
                      onClick={() => setActiveRadius(r)}
                      className={cn(
                        "flex-1 rounded-xl text-[9px] font-black transition-all uppercase tracking-tighter",
                        activeRadius === r ? "bg-white text-[#225BC3] shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                     >
                      {r}km
                     </button>
                  ))}
               </div>
            </div>
          </div>
          <div className="flex-1 w-full space-y-3">
            <h3 className="font-black text-[#225BC3] uppercase text-[9px] tracking-[0.2em]">Smart Search</h3>
            <form onSubmit={handleSearch} className="relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#225BC3]" />
               <input 
                type="text" 
                placeholder="Search for items..." 
                className="w-full h-12 pl-14 pr-6 rounded-2xl bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-[#225BC3]/10 outline-none font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
               />
               <Button type="submit" className="absolute right-2 top-1.5 h-9 px-6 rounded-xl bg-[#225BC3] text-white font-black text-xs">Search</Button>
            </form>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Trending Deals</h2>
                <p className="text-xs text-muted-foreground font-medium mt-1">Hottest listings right now</p>
              </div>
            </div>
            <Link href="/search">
              <Button variant="ghost" className="h-10 rounded-2xl font-black text-[#225BC3] hover:bg-[#225BC3]/5 gap-2 group text-xs">
                Browse All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" />
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
            <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-dashed border-slate-200">
               <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
               <p className="font-black text-[#225BC3] uppercase tracking-widest text-xs">No listings currently trending</p>
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="bg-[#225BC3] rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
             
             <div className="max-w-xl relative z-10 space-y-4 text-center md:text-left mx-auto md:mx-0">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto md:mx-0 shadow-xl">
                   <ShieldCheck className="w-6 h-6 text-[#34CBED]" />
                </div>
                <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tighter">Shop with total confidence.</h2>
                <p className="text-white/70 text-xs font-medium leading-relaxed">
                  Verified Sellers, Secure Deals, No Scams, Just Good Trades.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                   <Link href="/verify">
                     <Button className="bg-[#34CBED] hover:bg-[#34CBED]/90 text-white font-black h-9 px-6 rounded-xl shadow-xl text-[10px]">
                       Get Verified Badge
                     </Button>
                   </Link>
                   <Link href="/legal">
                     <Button variant="ghost" className="text-white/80 hover:text-white font-black h-9 px-6 rounded-xl text-[10px]">
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