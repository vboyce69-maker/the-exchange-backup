
"use client";

import { useState } from "react";
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
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Shirt,
  Footprints,
  Package,
  Search,
  ArrowRight,
  TrendingUp,
  Star,
  Clock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

const CATEGORIES = [
  { name: "Vehicles", icon: Car, color: "bg-blue-500" },
  { name: "Electronics", icon: Smartphone, color: "bg-purple-500" },
  { name: "Real Estate", icon: Home, color: "bg-green-500" },
  { name: "Clothing", icon: Shirt, color: "bg-pink-500" },
  { name: "Sneakers", icon: Footprints, color: "bg-orange-500" },
  { name: "Jewelry", icon: Watch, color: "bg-yellow-500" },
  { name: "Sports", icon: Bike, color: "bg-cyan-500" },
  { name: "Photography", icon: Camera, color: "bg-red-500" },
];

const FEATURED_LISTINGS = [
  {
    id: "1",
    title: "Palm Grove Residence",
    price: 4500000,
    location: "Cape Town, WC",
    imageUrl: "https://picsum.photos/seed/house1/800/600",
    sellerName: "Elite Estates",
    sellerRating: 4.9,
    isVerified: true,
    isBoosted: true,
  },
  {
    id: "2",
    title: "Canon EOS R5 Pro",
    price: 48000,
    location: "Sandton, GP",
    imageUrl: "https://picsum.photos/seed/camera/800/600",
    sellerName: "Studio Pix",
    sellerRating: 4.7,
    isVerified: false,
    isAuction: true,
    auctionEndDate: new Date(Date.now() + 10000000).toISOString(),
  },
  {
    id: "3",
    title: "Vintage Rolex Submariner",
    price: 220000,
    location: "Umhlanga, KZN",
    imageUrl: "https://picsum.photos/seed/watch/800/600",
    sellerName: "Horology Co",
    sellerRating: 5.0,
    isVerified: true,
  },
  {
    id: "4",
    title: "Mountain Bike XT-400",
    price: 12500,
    location: "Stellenbosch, WC",
    imageUrl: "https://picsum.photos/seed/bike/800/600",
    sellerName: "Trail Masters",
    sellerRating: 4.8,
    isVerified: true,
    isBoosted: true,
  },
];

export default function LandingPage() {
  const [activeRadius, setActiveRadius] = useState(25);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      
      {/* Hero Section - eBay/Takealot Style */}
      <section className="relative h-[60vh] flex items-center overflow-hidden bg-[#225BC3]">
        <div className="absolute inset-0 opacity-20">
           <Image 
            src="https://picsum.photos/seed/pattern/1920/1080" 
            alt="Pattern" 
            fill 
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <Badge className="bg-[#34CBED] text-white font-black border-none px-4 py-1.5 rounded-full">
              TRUSTED BY 50K+ SOUTH AFRICANS
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
              The smartest way to <span className="text-[#34CBED]">trade locally.</span>
            </h1>
            <p className="text-xl text-white/80 font-medium max-w-lg">
              Verified sellers, secure escrow payments, and vetted safe-zone meetups.
            </p>
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black h-16 px-10 rounded-2xl text-lg shadow-xl shadow-orange-500/20">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md h-16 px-10 rounded-2xl text-lg font-bold">
                Sell Item
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative aspect-square group">
             <div className="absolute inset-0 bg-white/10 rounded-[4rem] rotate-6 group-hover:rotate-3 transition-transform duration-500" />
             <div className="absolute inset-0 bg-white/5 rounded-[4rem] -rotate-3 group-hover:-rotate-1 transition-transform duration-500" />
             <div className="relative h-full w-full rounded-[4rem] overflow-hidden border-8 border-white/10 shadow-2xl">
                <Image src="https://picsum.photos/seed/premium/800/800" alt="Premium" fill className="object-cover" />
                <div className="absolute bottom-8 left-8 bg-white p-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4">
                   <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest mb-1">Top Auction</p>
                   <p className="text-xl font-black text-slate-900">Rolex Daytona</p>
                   <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-700 border-none">R 450,000</Badge>
                      <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> 2h left</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        {/* Takealot-style Category Scroller */}
        <section className="mb-16 -mt-24 relative z-30">
          <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center gap-4 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.name} 
                  href={`/category/${cat.name.toLowerCase()}`}
                  className="flex flex-col items-center gap-2 min-w-[100px] p-4 rounded-3xl hover:bg-slate-50 transition-all group"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", cat.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Facebook-style Local Filter Bar */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
             <div className="bg-white h-14 px-6 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100">
                <MapPin className="w-5 h-5 text-[#225BC3]" />
                <span className="font-bold text-sm text-slate-700">Johannesburg, GP</span>
             </div>
             <div className="flex bg-slate-100 p-1.5 rounded-2xl h-14">
                {[5, 10, 25, 50].map(r => (
                   <button 
                    key={r} 
                    onClick={() => setActiveRadius(r)}
                    className={cn(
                      "px-6 rounded-xl text-xs font-black transition-all",
                      activeRadius === r ? "bg-white text-[#225BC3] shadow-md" : "text-slate-400"
                    )}
                   >
                    {r}km
                   </button>
                ))}
             </div>
          </div>
          <div className="flex-1 max-w-md w-full relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
             <input 
              type="text" 
              placeholder="Search for items, brands or categories..." 
              className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-[#225BC3]/10 outline-none font-medium"
             />
          </div>
        </section>

        {/* eBay/Takealot Trending Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Trending Now</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">High demand items in your area</p>
              </div>
            </div>
            <Button variant="ghost" className="font-black text-[#225BC3] gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURED_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </section>

        {/* Protection Banner - Takealot style */}
        <section className="mb-16">
          <div className="bg-[#225BC3] rounded-[3rem] p-12 text-white relative overflow-hidden">
             <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-gradient-to-l from-white to-transparent" />
             <div className="max-w-xl relative z-10 space-y-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                   <ShieldCheck className="w-10 h-10 text-[#34CBED]" />
                </div>
                <h2 className="text-4xl font-black leading-tight">Shop with total confidence.</h2>
                <p className="text-white/70 text-lg font-medium">
                  Our unique escrow system holds your payment until you've met the seller and verified the item. No scams, no risk.
                </p>
                <Button className="bg-[#34CBED] text-white font-black h-14 px-8 rounded-2xl">
                  Learn How it Works
                </Button>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
