
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
  Search
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Vehicles", icon: Car },
  { name: "Electronics", icon: Smartphone },
  { name: "Real Estate", icon: Home },
  { name: "Clothing", icon: Shirt },
  { name: "Sneakers", icon: Footprints },
  { name: "Jewelry", icon: Watch },
  { name: "Sports", icon: Bike },
  { name: "Photography", icon: Camera },
  { name: "Home & Garden", icon: Flower2 },
  { name: "Building Materials", icon: Hammer },
  { name: "Baby Clothing", icon: Baby },
  { name: "Business Services", icon: Briefcase },
  { name: "Classifieds", icon: Newspaper },
  { name: "Hobbies", icon: Shapes },
  { name: "Entertainment", icon: Tv },
  { name: "Misc", icon: Package },
];

const FEATURED_LISTINGS = [
  {
    id: "1",
    title: "Mountain Bike XT-400",
    price: 4500,
    location: "Downtown, Metro City",
    imageUrl: "https://picsum.photos/seed/bike/600/400",
    sellerName: "Alex Rivera",
    sellerRating: 4.9,
    isVerified: true,
    isBoosted: true,
  },
  {
    id: "2",
    title: "Canon EOS R5 Mirrorless",
    price: 48000,
    location: "South Park, Queens",
    imageUrl: "https://picsum.photos/seed/camera/600/400",
    sellerName: "Studio Pix",
    sellerRating: 4.7,
    isVerified: false,
    isAuction: true,
    timeLeft: "2h 45m",
  },
  {
    id: "3",
    title: "Vintage Luxury Watch",
    price: 22000,
    location: "Harbor View",
    imageUrl: "https://picsum.photos/seed/watch/600/400",
    sellerName: "Collector John",
    sellerRating: 5.0,
    isVerified: true,
  },
  {
    id: "4",
    title: "Modern Minimalist Sofa",
    price: 12500,
    location: "West End",
    imageUrl: "https://picsum.photos/seed/sofa/600/400",
    sellerName: "Furniture House",
    sellerRating: 4.5,
    isVerified: true,
    isBoosted: true,
  },
];

const RADIUS_FILTERS = [5, 10, 25];

export default function LandingPage() {
  const [activeRadius, setActiveRadius] = useState(25);

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-[#225BC3] overflow-hidden py-16 lg:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-[#34CBED] text-white font-bold px-3 py-1 border-none">
              Trust & Safety First
            </Badge>
            <h1 className="text-4xl lg:text-7xl font-headline font-extrabold text-white mb-6 leading-tight tracking-tight">
              Local Deals You Can <span className="text-[#34CBED]">Actually</span> Trust.
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-xl leading-relaxed">
              Join the most secure peer-to-peer marketplace in South Africa.
              Verified identities, secure meeting points, and protected payments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/create">
                <Button size="lg" className="bg-[#34CBED] text-white hover:bg-[#34CBED]/90 font-bold px-8 h-14 rounded-2xl shadow-xl">
                  Post Your Item - Free
                </Button>
              </Link>
              <Link href="/auctions">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 h-14 rounded-2xl">
                  Live Auctions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Proximity Filter Bar */}
        <section className="mb-12">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border-none flex flex-col md:flex-row items-center justify-between gap-6 -mt-20 relative z-20">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                className="w-full h-14 bg-[#EEF1F3] rounded-2xl pl-12 pr-4 font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Show items within:</span>
              <div className="flex bg-[#EEF1F3] p-1.5 rounded-2xl">
                {RADIUS_FILTERS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRadius(r)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      activeRadius === r ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r}km
                  </button>
                ))}
              </div>
              <Button variant="ghost" className="rounded-2xl h-14 w-14 border border-slate-100 bg-white">
                <SlidersHorizontal className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold text-[#225BC3]">Browse Categories</h2>
            <Link href="/categories" className="text-primary text-sm font-bold flex items-center hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.slice(0, 8).map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.name} 
                  href={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`}
                  className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center group border border-transparent hover:border-primary/10"
                >
                  <div className="w-12 h-12 bg-[#EEF1F3] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                    <Icon className="w-6 h-6 text-[#225BC3]" />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recommended Items */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-headline font-bold text-[#225BC3]">Nearby verified deals</h2>
              <p className="text-muted-foreground text-sm">Showing items within {activeRadius}km of your location</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </section>
      </main>

      {/* Monetization / Trust Banner */}
      <section className="bg-white border-y border-slate-100 py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-3xl mb-6">
                <ShieldCheck className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="font-bold text-xl mb-2 text-[#225BC3]">ID Verified Badges</h4>
              <p className="text-sm text-muted-foreground max-w-xs">Enhance trust for just R50. Verified sellers close deals 3x faster.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-3xl mb-6">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="font-bold text-xl mb-2 text-[#225BC3]">Featured Listing Boost</h4>
              <p className="text-sm text-muted-foreground max-w-xs">Pay R20 to stay at the top of searches for 24 hours.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-100 p-4 rounded-3xl mb-6">
                <MapPin className="w-10 h-10 text-cyan-600" />
              </div>
              <h4 className="font-bold text-xl mb-2 text-[#225BC3]">Secure Meetups</h4>
              <p className="text-sm text-muted-foreground max-w-xs">Automatic safe-zone suggestions for every trade.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
