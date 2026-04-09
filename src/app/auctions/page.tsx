
"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, Loader2, Search, TrendingUp, Clock, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, QueryConstraint } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function AuctionsContent() {
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [now, setNow] = useState<number | null>(null);

  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('q');

  // Use a stable timestamp for filtering auctions that haven't ended yet
  useEffect(() => {
    setNow(new Date().getTime());
    // Update every minute to keep "Ending Soon" accurate
    const interval = setInterval(() => setNow(new Date().getTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  const auctionsQuery = useMemoFirebase(() => {
    const constraints: QueryConstraint[] = [];
    
    // STRICTLY AUCTIONS
    constraints.push(where("isAuction", "==", true));

    if (categoryFilter) {
      constraints.push(where("categoryId", "==", categoryFilter.toLowerCase()));
    }

    constraints.push(orderBy("postedDate", "desc"));

    return query(collection(db, "publicListings"), ...constraints);
  }, [db, categoryFilter]);

  const { data: rawAuctions, isLoading, error } = useCollection(auctionsQuery);

  // Client-side search filtering
  const auctions = useMemo(() => {
    if (!rawAuctions) return [];
    if (!searchQuery) return rawAuctions;
    
    const term = searchQuery.toLowerCase();
    return rawAuctions.filter(a => 
      a.title.toLowerCase().includes(term) || 
      a.description.toLowerCase().includes(term)
    );
  }, [rawAuctions, searchQuery]);

  const endingSoon = useMemo(() => {
    if (!auctions || now === null) return [];
    return auctions.filter(a => {
      if (!a.auctionEndDate) return false;
      const end = new Date(a.auctionEndDate).getTime();
      const diff = end - now;
      // Define "Ending Soon" as less than 24 hours away
      return diff < 86400000 && diff > 0;
    });
  }, [auctions, now]);

  const clearFilters = () => {
    router.push('/auctions');
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-[#FF8C00] text-white font-black px-4 py-1 border-none rounded-full uppercase tracking-widest text-[10px]">
              Live Bidding
            </Badge>
            {(categoryFilter || searchQuery) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 rounded-full bg-white text-[#225BC3] font-black text-[9px] uppercase tracking-widest border border-[#225BC3]/10 hover:bg-slate-50"
                onClick={clearFilters}
              >
                <X className="w-3 h-3 mr-1" /> Clear Filter
              </Button>
            )}
          </div>
          
          <h1 className="text-4xl font-black text-[#225BC3] mb-4 flex items-center gap-3 tracking-tighter">
            <Gavel className="w-10 h-10 text-[#225BC3]" />
            Auction House
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            Discover premium timed auctions from verified sellers. Bidding is secure, automated, and platform-protected.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 rounded-3xl border-none shadow-xl bg-white">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black uppercase text-[10px] tracking-widest">Connection Error</AlertTitle>
            <AlertDescription className="font-medium text-sm">
              We encountered a problem fetching the live auction data.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="bg-white/80 backdrop-blur-md border-none p-1.5 h-14 rounded-2xl shadow-xl inline-flex">
            <TabsTrigger value="all" className="rounded-xl px-8 h-full font-black text-xs uppercase data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
              All Active Bids
            </TabsTrigger>
            <TabsTrigger value="ending" className="rounded-xl px-8 h-full font-black text-xs uppercase data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
              Ending Soon ({endingSoon.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-[#225BC3] mb-4" />
                <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Syncing auction house...</p>
              </div>
            ) : auctions && auctions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {auctions.map((listing) => (
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
                    quantity={listing.quantity}
                    auctionEndDate={listing.auctionEndDate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-[#225BC3]/10">
                 <Gavel className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                 <p className="font-black text-[#225BC3] uppercase tracking-widest">No active auctions</p>
                 <p className="text-muted-foreground text-sm font-medium">Try a different category or check back later.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ending" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {endingSoon.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {endingSoon.map((listing) => (
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
                    quantity={listing.quantity}
                    auctionEndDate={listing.auctionEndDate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-[#225BC3]/10">
                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="font-black text-[#225BC3] uppercase tracking-widest">Nothing ending immediately</p>
                <p className="text-muted-foreground text-sm font-medium">Browse all auctions to find your next deal.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AuctionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EEF1F3]">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-[#225BC3] animate-spin mb-4" />
          <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Initializing...</p>
        </div>
      </div>
    }>
      <AuctionsContent />
    </Suspense>
  );
}
