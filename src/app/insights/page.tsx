
"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { getSellerDemandInsights, SellerDemandInsightsOutput } from "@/ai/flows/seller-demand-insights";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  MapPin, 
  Lightbulb, 
  BarChart3,
  Loader2,
  Zap,
  ChevronRight,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, writeBatch } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

const INSIGHTS_CACHE_KEY = 'exchange_insights_cache';
const CACHE_TTL = 3600000; // 1 hour

export default function InsightsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [insights, setInsights] = useState<SellerDemandInsightsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);

  // Fetch active listings for this user to enable bulk boosting
  const activeListingsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, "publicListings"), where("sellerId", "==", user.uid));
  }, [db, user]);

  const { data: userListings } = useCollection(activeListingsQuery);

  useEffect(() => {
    async function fetchInsights() {
      // COST REDUCTION: Check client-side cache first
      const cachedData = localStorage.getItem(INSIGHTS_CACHE_KEY);
      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_TTL) {
            setInsights(data);
            setIsCached(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Insights cache invalid");
        }
      }

      try {
        const result = await getSellerDemandInsights({
          sellerId: user?.uid || "guest_123",
          currentListingsCategories: ["Electronics", "Bikes"],
          recentSearchTerms: ["laptop", "camera", "ebike"],
          sellerLocation: { latitude: -26.2041, longitude: 28.0473 } // Johannesburg
        });
        
        setInsights(result);
        
        // Save to cache to reduce monthly AI costs
        localStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [user]);

  const refreshInsights = () => {
    localStorage.removeItem(INSIGHTS_CACHE_KEY);
    window.location.reload();
  };

  const handleBoostListings = async () => {
    if (!user || !db || !userListings) {
      toast({
        variant: "destructive",
        title: "Action Restricted",
        description: "Please sign in and ensure you have active listings to boost.",
      });
      return;
    }

    setIsBoosting(true);
    try {
      // Bulk update using non-blocking updates (simulation since we can't iterate batch easily in non-blocking helper)
      for (const listing of userListings) {
        if (!listing.isBoosted) {
          const ref = doc(db, "publicListings", listing.id);
          updateDoc(ref, { isBoosted: true, boostedAt: new Date().toISOString() });
        }
      }
      
      toast({
        title: "Inventory Boosted!",
        description: "All your active items are now prioritized in search results.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Boost Error", description: "Could not apply premium status." });
    } finally {
      setIsBoosting(false);
    }
  };

  const handleViewVolumeDetails = () => {
    toast({
      title: "Analysis Depth",
      description: "Calculating historical volume trends and competitive density for these categories...",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Running AI Market Analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#225BC3] text-white flex items-center gap-1 w-fit rounded-xl px-4 py-1 font-black uppercase text-[10px] tracking-widest">
                <Zap className="w-3 h-3 fill-current" />
                AI Market Analyst
              </Badge>
              {isCached && (
                <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold text-[9px] uppercase">
                  <Clock className="w-2.5 h-2.5 mr-1" /> Results Cached
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-black text-[#225BC3] uppercase tracking-tighter">Market Demand Insights</h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              We analyze regional search data and supply volume to help you price and position your listings for the fastest possible sale.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={refreshInsights} className="rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest">
              Refresh Data
            </Button>
            <Button 
              className="bg-[#FF8C00] text-white font-black rounded-2xl h-12 px-8 shadow-xl hover:scale-105 transition-all" 
              size="lg"
              onClick={handleBoostListings}
              disabled={isBoosting || !userListings?.length}
            >
              {isBoosting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Boost All Listings"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="lg:col-span-3 rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-4 ring-1 ring-[#225BC3]/5">
            <div className="flex items-center gap-3 text-[#225BC3]">
              <BarChart3 className="w-6 h-6" />
              <h2 className="text-xl font-black uppercase tracking-tight">Strategic Market Overview</h2>
            </div>
            <p className="text-lg leading-relaxed text-slate-700 font-bold italic">
              "{insights?.generalMarketTrends}"
            </p>
          </Card>

          <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-[#225BC3] font-black uppercase tracking-tight">
                <MapPin className="w-5 h-5" />
                Regional Hotspots
              </CardTitle>
              <CardDescription className="font-bold text-slate-500">Areas with peak buyer activity this week</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="relative aspect-video bg-blue-50 rounded-[2rem] overflow-hidden flex items-center justify-center border-2 border-dashed border-[#225BC3]/10">
                 <div className="text-center p-8 relative z-10">
                    <TrendingUp className="w-16 h-16 text-[#225BC3]/20 mx-auto mb-4" />
                    <p className="text-[#225BC3] font-black uppercase text-xs tracking-widest">Interactive Supply Heatmap</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2">Target listings to these high-conversion zones</p>
                 </div>
                 <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-[#34CBED]/20 rounded-full blur-3xl animate-pulse" />
                 <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#225BC3]/10 rounded-full blur-[50px] animate-pulse" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights?.highDemandAreas.map((area, i) => (
                  <div key={i} className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm flex flex-col gap-3 group hover:ring-2 hover:ring-[#225BC3]/5 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{area.areaName}</span>
                      <Badge className="bg-green-100 text-green-700 border-none font-black text-[9px] uppercase">
                        {area.demandScore}%
                      </Badge>
                    </div>
                    <Progress value={area.demandScore} className="h-2 bg-slate-100" />
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{area.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-[#FF8C00] font-black uppercase tracking-tight">
                <Lightbulb className="w-5 h-5 fill-current" />
                Category Intel
              </CardTitle>
              <CardDescription className="font-bold text-slate-500">Fastest moving categories</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {insights?.optimalListingCategories.map((cat, i) => (
                <div key={i} className="p-5 border border-slate-50 rounded-2xl bg-slate-50/50 flex flex-col gap-3 group hover:bg-white hover:shadow-lg transition-all">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900 text-xs uppercase group-hover:text-[#225BC3] transition-colors">{cat.categoryName}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{cat.demandScore}%</span>
                  </div>
                  <Progress value={cat.demandScore} className="h-1.5 bg-white" />
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{cat.reason}</p>
                </div>
              ))}
              <div className="pt-4">
                <Button 
                  className="w-full rounded-2xl font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white h-12 shadow-xl" 
                  variant="default"
                  onClick={handleViewVolumeDetails}
                >
                  View Volume Details
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
