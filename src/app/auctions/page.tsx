
"use client";

import { useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, Loader2, Search, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";

export default function AuctionsPage() {
  const db = useFirestore();

  const auctionsQuery = useMemoFirebase(() => {
    return query(
      collection(db, "publicListings"),
      where("isAuction", "==", true),
      orderBy("postedDate", "desc")
    );
  }, [db]);

  const { data: auctions, isLoading } = useCollection(auctionsQuery);

  const endingSoon = useMemo(() => {
    if (!auctions) return [];
    // Simulate finding auctions ending in < 24h
    return auctions.filter(a => {
      if (!a.auctionEndDate) return false;
      const end = new Date(a.auctionEndDate).getTime();
      const now = new Date().getTime();
      return (end - now) < 86400000 && (end - now) > 0;
    });
  }, [auctions]);

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <Badge className="mb-4 bg-[#34CBED] text-white font-black px-4 py-1 border-none rounded-full uppercase tracking-widest text-[10px]">
            Live Bidding
          </Badge>
          <h1 className="text-4xl font-black text-[#225BC3] mb-4 flex items-center gap-3 tracking-tighter">
            <Gavel className="w-10 h-10 text-[#225BC3]" />
            Active Auctions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            Discover premium items from verified sellers. Bidding is secure and automated.
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="bg-white/80 backdrop-blur-md border-none p-1.5 h-14 rounded-2xl shadow-xl inline-flex">
            <TabsTrigger value="all" className="rounded-xl px-8 h-full font-black text-xs uppercase data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
              All Auctions
            </TabsTrigger>
            <TabsTrigger value="ending" className="rounded-xl px-8 h-full font-black text-xs uppercase data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
              Ending Soon
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="animate-in fade-in slide-in-from-bottom-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#225BC3] mb-4" />
                <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Fetching live data...</p>
              </div>
            ) : auctions && auctions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {auctions.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm">
                 <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                 <p className="font-black text-[#225BC3] uppercase tracking-widest">No active auctions</p>
                 <p className="text-muted-foreground text-sm font-medium">Check back later or list your own!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ending">
            {endingSoon.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {endingSoon.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="font-black text-[#225BC3] uppercase tracking-widest">Nothing ending immediately</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
