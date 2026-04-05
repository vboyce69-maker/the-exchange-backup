
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  const [insights, setInsights] = useState<SellerDemandInsightsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const result = await getSellerDemandInsights({
          sellerId: "user_123",
          currentListingsCategories: ["Electronics", "Bikes"],
          recentSearchTerms: ["laptop", "camera", "ebike"],
          sellerLocation: { latitude: 40.7128, longitude: -74.0060 }
        });
        setInsights(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Analyzing marketplace data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary text-primary-foreground flex items-center gap-1 w-fit">
              <Zap className="w-3 h-3 fill-current" />
              AI Market Analyst
            </Badge>
            <h1 className="text-4xl font-headline font-bold mb-4">Seller Demand Spotlights</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We analyze thousands of search terms and listings to help you find the best places 
              and categories to sell your items.
            </p>
          </div>
          <Button className="bg-accent text-accent-foreground font-bold" size="lg">
            Boost Listing Visibility
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Market Trends Summary */}
          <Card className="lg:col-span-3 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Strategic Market Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-foreground/80 italic">
                "{insights?.generalMarketTrends}"
              </p>
            </CardContent>
          </Card>

          {/* High Demand Geographic Areas (Simulated Heat Map Info) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Regional Hotspots
              </CardTitle>
              <CardDescription>Areas where buyers are most active right now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative aspect-video bg-secondary/30 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-dashed border-primary/20">
                 <div className="text-center p-8">
                    <TrendingUp className="w-12 h-12 text-primary/30 mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium">Interactive Heatmap Visualization</p>
                    <p className="text-xs text-muted-foreground/60">Target your listing delivery to these zones</p>
                 </div>
                 {/* Visual simulation of heat spots */}
                 <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                 <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights?.highDemandAreas.map((area, i) => (
                  <div key={i} className="p-4 border rounded-xl bg-white shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{area.areaName}</span>
                      <Badge variant="outline" className="text-primary border-primary">
                        Score: {area.demandScore}
                      </Badge>
                    </div>
                    <Progress value={area.demandScore} className="h-1.5" />
                    <p className="text-sm text-muted-foreground">{area.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimal Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Category Insights
              </CardTitle>
              <CardDescription>What you should list today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights?.optimalListingCategories.map((cat, i) => (
                <div key={i} className="p-4 border rounded-xl bg-white shadow-sm flex flex-col gap-3 group hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-bold group-hover:text-primary transition-colors">{cat.categoryName}</span>
                    <span className="text-xs font-bold text-muted-foreground">{cat.demandScore}% Demand</span>
                  </div>
                  <Progress value={cat.demandScore} className="h-1" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.reason}</p>
                </div>
              ))}
              <div className="pt-4">
                <Button className="w-full variant-outline group" variant="outline">
                  View Category Details
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
