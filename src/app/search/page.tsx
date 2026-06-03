"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { ListingMap } from "@/components/ListingMap";
import {
  Loader2,
  X,
  ChevronDown,
  ShoppingBag,
  AlertCircle,
  LayoutGrid,
  Map as MapIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function SearchContent() {
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryFilter = searchParams.get("category");
  const searchQuery = searchParams.get("q");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [activeCondition, setActiveCondition] = useState<string | null>(null);
  const [viewType, setViewType] = useState<string>("grid");

  const listingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "publicListings"),
      orderBy("postedDate", "desc"),
    );
  }, [db]);

  const { data: rawListings, isLoading, error } = useCollection(listingsQuery);

  const listings = useMemo(() => {
    if (!rawListings) return [];

    let filtered = rawListings.filter((item) => {
      const matchesCategory = categoryFilter
        ? item.categoryId === categoryFilter.toLowerCase()
        : true;

      const matchesSearch = searchQuery
        ? item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesPrice =
        item.price >= priceRange[0] && item.price <= priceRange[1];
      const matchesCondition = activeCondition
        ? item.condition === activeCondition
        : true;

      return (
        matchesCategory && matchesSearch && matchesPrice && matchesCondition
      );
    });

    return filtered.sort((a, b) => {
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;
      return (
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
    });
  }, [rawListings, categoryFilter, searchQuery, priceRange, activeCondition]);

  const clearFilters = () => {
    router.push("/search");
    setPriceRange([0, 100000]);
    setActiveCondition(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-[#225BC3] text-white font-black px-4 py-1 border-none rounded-full uppercase tracking-widest text-[10px]">
                Marketplace
              </Badge>
              {(categoryFilter || searchQuery || activeCondition) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-full bg-white text-[#225BC3] font-black text-[9px] uppercase tracking-widest border border-[#225BC3]/10 hover:bg-slate-50"
                  onClick={clearFilters}
                >
                  <X className="w-3 h-3 mr-1" /> Clear Filters
                </Button>
              )}
            </div>

            <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter flex items-center gap-3">
              <ShoppingBag className="w-10 h-10" />
              {categoryFilter ? (
                <span className="capitalize">{categoryFilter}</span>
              ) : searchQuery ? (
                <span>"{searchQuery}" Results</span>
              ) : (
                "Browse All"
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest border-none shadow-sm bg-white"
                >
                  Condition: {activeCondition || "All"}{" "}
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl border-none shadow-2xl p-2">
                {["New", "Like new", "Good", "Used"].map((c) => (
                  <DropdownMenuItem
                    key={c}
                    onClick={() => setActiveCondition(c)}
                    className="rounded-xl font-bold p-3"
                  >
                    {c}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => setActiveCondition(null)}
                  className="rounded-xl font-bold p-3 text-red-500"
                >
                  Reset Condition
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest border-none shadow-sm bg-white"
                >
                  Price: R{priceRange[0]} - R{priceRange[1]}{" "}
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-3xl border-none shadow-2xl p-8 space-y-6">
                <div className="space-y-4">
                  <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Range (R)
                  </p>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000}
                    step={1000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs font-bold text-[#225BC3]">
                    <span>R{priceRange[0]}</span>
                    <span>R{priceRange[1]}</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-8 rounded-3xl border-none shadow-xl bg-white"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black uppercase text-[10px] tracking-widest">
              Connection Error
            </AlertTitle>
            <AlertDescription className="font-medium text-sm">
              We encountered a problem fetching the marketplace data.
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={viewType}
          onValueChange={setViewType}
          className="space-y-8"
        >
          <div className="flex justify-center md:justify-start">
            <TabsList className="bg-white rounded-2xl h-14 p-1.5 shadow-xl border border-slate-50">
              <TabsTrigger
                value="grid"
                className="rounded-xl h-full px-8 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <LayoutGrid className="w-4 h-4" /> Grid View
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="rounded-xl h-full px-8 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <MapIcon className="w-4 h-4" /> Map View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-0 outline-none">
            {isLoading || !db ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-[#225BC3] mb-4" />
                <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest text-center">
                  Fetching items for you...
                </p>
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    isAuction={listing.isAuction}
                    isBulk={listing.isBulk}
                    isBoosted={listing.isBoosted}
                    quantity={listing.quantity}
                    auctionEndDate={listing.auctionEndDate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[4rem] shadow-sm border-2 border-dashed border-slate-100">
                <X className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <h3 className="font-black text-[#225BC3] text-xl uppercase tracking-widest mb-2">
                  No matching items
                </h3>
                <p className="text-muted-foreground text-sm font-medium">
                  Try broadening your filters or search terms.
                </p>
                <Button
                  onClick={clearFilters}
                  className="mt-8 rounded-2xl bg-[#225BC3] font-black h-12 px-8"
                >
                  Browse Everything
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0 outline-none">
            {!isLoading && listings && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <ListingMap listings={listings} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC]">
          <Navigation />
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-[#225BC3] animate-spin mb-4" />
            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
              Searching...
            </p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
