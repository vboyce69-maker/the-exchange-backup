
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
  Tv
} from "lucide-react";
import Link from "next/link";

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
  {
    id: "5",
    title: "Wireless ANC Headphones",
    price: 5200,
    location: "Tech Hub",
    imageUrl: "https://picsum.photos/seed/headphones/600/400",
    sellerName: "Gadget Galore",
    sellerRating: 4.8,
    isVerified: true,
  },
  {
    id: "6",
    title: "Gaming Laptop Pro 16",
    price: 25000,
    location: "Central District",
    imageUrl: "https://picsum.photos/seed/laptop/600/400",
    sellerName: "PC Masters",
    sellerRating: 4.6,
    isVerified: false,
    isAuction: true,
    timeLeft: "5h 12m",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-accent text-accent-foreground font-bold px-3 py-1">
              Verified Marketplace
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-headline font-extrabold text-white mb-6 leading-tight">
              Buy and Sell with <span className="text-accent underline decoration-4 underline-offset-8">Confidence</span> Local To You.
            </h1>
            <p className="text-lg lg:text-xl text-primary-foreground/90 mb-8 max-w-xl leading-relaxed">
              Every user is verified. Every transaction is secured. Join the community where trust comes standard. 
              <span className="font-bold"> Secure payments, zero scams.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-8">
                Start Selling
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 px-8">
                Browse Auctions
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Category Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold text-foreground">Top Categories</h2>
            <Link href="/categories" className="text-primary text-sm font-semibold flex items-center hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.name} 
                  href={`/category/${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                  className="bg-white p-6 rounded-2xl border border-transparent shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-semibold text-xs text-foreground line-clamp-1">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Filters & Discovery */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 bg-white rounded-2xl shadow-sm border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-background border rounded-full text-sm font-medium cursor-pointer hover:border-primary transition-colors">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Within 25km</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background border rounded-full text-sm font-medium cursor-pointer hover:border-primary transition-colors">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>All Filters</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-muted-foreground">Showing </span>
                <span className="font-bold">2,450 </span>
                <span className="text-muted-foreground">verified listings near you</span>
              </div>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-headline font-bold text-foreground">Recommended for You</h2>
              <p className="text-muted-foreground text-sm mt-1">Based on your location and interests</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FEATURED_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="px-12 border-primary text-primary hover:bg-primary/5 rounded-full font-bold">
              Load More Listings
            </Button>
          </div>
        </section>
      </main>

      {/* Trust Banner */}
      <section className="bg-white border-y py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">ID Verified Community</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">We verify identity to prevent scams and build a trusted environment for everyone.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 p-3 rounded-xl">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Escrow Protected</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Funds are held securely until both parties confirm a successful exchange.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Safe Meeting Points</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Our AI suggests public, safe locations for item handovers based on location.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background py-12 border-t mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-headline font-bold text-lg text-primary">LocalBid Exchange</span>
          </div>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            The most trusted peer-to-peer marketplace with zero-scam policy and secure transactions.
          </p>
          <div className="flex justify-center gap-8 text-sm font-medium text-foreground">
            <Link href="/terms" className="hover:text-primary">Terms</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/help" className="hover:text-primary">Help Center</Link>
            <Link href="/safety" className="hover:text-primary">Safety Tips</Link>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            © 2025 LocalBid Exchange. Built for community trust.
          </p>
        </div>
      </footer>
    </div>
  );
}
