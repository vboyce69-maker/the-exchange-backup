
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
  Hammer,
  Baby,
  Flower2,
  Newspaper,
  Shapes,
  Tv,
  Briefcase,
  Search,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

const CATEGORIES = [
  { name: "Vehicles", icon: Car },
  { name: "Electronics", icon: Smartphone },
  { name: "Real Estate", icon: Home },
  { name: "Clothing", icon: Shirt },
  { name: "Sneakers", icon: Footprints },
  { name: "Jewelry", icon: Watch },
  { name: "Sports", icon: Bike },
  { name: "Photography", icon: Camera },
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
    timeLeft: "2h 45m",
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Immersive Reference Style */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://picsum.photos/seed/hero-bg/1920/1080" 
          alt="Hero" 
          fill 
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Badge className="mb-6 bg-accent text-white font-bold px-4 py-1.5 border-none rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            Premium Marketplace
          </Badge>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Find perfection <br /> <span className="text-accent">effortlessly.</span>
          </h1>
          <div className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-white/80 font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The Exchange is the most secure and beautifully designed marketplace 
            to trade premium items with complete peace of mind.
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/create">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 font-black px-10 h-16 rounded-[1.5rem] shadow-2xl shadow-accent/40 text-lg">
                Start Selling
              </Button>
            </Link>
            <Link href="/auctions">
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-10 h-16 rounded-[1.5rem] text-lg font-bold">
                Live Auctions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-16">
        {/* Modern Search & Filter */}
        <section className="relative -mt-32 z-20 mb-20">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground transition-colors group-focus-within:text-accent" />
              <input 
                type="text" 
                placeholder="What are you searching for today?" 
                className="w-full h-16 bg-muted/40 rounded-[1.5rem] pl-16 pr-4 font-bold text-lg focus:ring-2 focus:ring-accent/10 transition-all outline-none border-none"
              />
            </div>
            <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
              <div className="flex bg-muted/60 p-2 rounded-[1.5rem]">
                {[5, 10, 25].map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRadius(r)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-black transition-all",
                      activeRadius === r ? "bg-white text-accent shadow-lg" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {r}km
                  </button>
                ))}
              </div>
              <Button variant="ghost" className="rounded-[1.5rem] h-16 w-16 bg-muted/40 hover:bg-muted/60 border-none transition-all">
                <SlidersHorizontal className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </section>

        {/* Immersive Categories */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black text-primary mb-2">Explore</h2>
              <p className="text-muted-foreground font-bold">Curated categories for every lifestyle</p>
            </div>
            <Link href="/categories" className="text-accent font-black text-sm flex items-center gap-2 group">
              Full List <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.name} 
                  href={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`}
                  className="bg-muted/30 p-8 rounded-[2rem] border border-transparent hover:border-accent/10 hover:bg-white hover:shadow-2xl transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-accent/10 group-hover:-translate-y-2 transition-all">
                    <Icon className="w-7 h-7 text-primary group-hover:text-accent" />
                  </div>
                  <span className="font-black text-[11px] uppercase tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Premium Listings Grid */}
        <section>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-primary mb-2">Premium Deals</h2>
              <p className="text-muted-foreground font-bold">Nearby items within {activeRadius}km</p>
            </div>
            <div className="flex gap-2">
               <Badge className="bg-green-500/10 text-green-600 border-none font-bold">Online: 1.2k</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {FEATURED_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </section>
      </main>

      {/* Monetization / Advantage Section */}
      <section className="bg-primary text-white py-24 mt-20 rounded-t-[4rem]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 group">
              <div className="bg-accent/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <h4 className="text-2xl font-black">ID Verification</h4>
              <p className="text-white/60 font-medium leading-relaxed">
                Enhance trust instantly with our R50 "Verified Person" badge. 
                Sellers with this badge see 3.5x higher engagement rates.
              </p>
            </div>
            <div className="space-y-6 group">
              <div className="bg-blue-500/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-2xl font-black">Market Boost</h4>
              <p className="text-white/60 font-medium leading-relaxed">
                Stay at the top of local results for just R20. 
                Perfect for urgent sales or high-ticket items.
              </p>
            </div>
            <div className="space-y-6 group">
              <div className="bg-cyan-500/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-cyan-400" />
              </div>
              <h4 className="text-2xl font-black">Safe Exchange</h4>
              <p className="text-white/60 font-medium leading-relaxed">
                Automated safe-zone meeting point suggestions for every single trade. 
                Your safety is our absolute priority.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
