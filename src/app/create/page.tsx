
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Gavel, Package, ImagePlus, Zap, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function CreateListingPage() {
  const [isAuction, setIsAuction] = useState(false);
  const [duration, setDuration] = useState("3");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Listing Created!",
      description: isAuction 
        ? `Your ${duration}-day auction is now live.` 
        : "Your item has been listed for direct sale.",
    });
    // In a real app, this would use addDocumentNonBlocking
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              Create New Listing
            </h1>
            <p className="text-muted-foreground mt-2">List your item for sale or start an auction for the highest bidder.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="rounded-3xl shadow-sm border-none overflow-hidden">
              <CardHeader className="bg-primary/5 pb-6">
                <CardTitle className="text-lg">Basic Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="title">Listing Title</Label>
                  <Input id="title" placeholder="e.g., Canon EOS R5 Mirrorless Camera" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="vehicles">Vehicles</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the condition, features, and any flaws..." className="min-h-[120px]" required />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm border-none overflow-hidden">
              <CardHeader className="bg-accent/5 pb-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pricing & Auction</CardTitle>
                  <CardDescription>Choose how you want to sell</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="auction-mode" className="text-sm font-bold">Auction Mode</Label>
                  <Switch 
                    id="auction-mode" 
                    checked={isAuction} 
                    onCheckedChange={setIsAuction} 
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {!isAuction ? (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="price">Direct Sale Price (R)</Label>
                    <Input id="price" type="number" placeholder="4500" required />
                    <p className="text-xs text-muted-foreground">Set a fair price for an immediate purchase.</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div className="grid gap-2">
                      <Label htmlFor="start-bid">Starting Bid (R)</Label>
                      <Input id="start-bid" type="number" placeholder="1000" required />
                    </div>

                    <div className="space-y-3">
                      <Label>Auction Duration</Label>
                      <RadioGroup defaultValue="3" onValueChange={setDuration} className="grid grid-cols-3 gap-4">
                        <div>
                          <RadioGroupItem value="1" id="d1" className="peer sr-only" />
                          <Label
                            htmlFor="d1"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                          >
                            <span className="text-lg font-bold">1 Day</span>
                            <span className="text-[10px] text-muted-foreground">Fast turnaround</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="3" id="d3" className="peer sr-only" />
                          <Label
                            htmlFor="d3"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                          >
                            <span className="text-lg font-bold">3 Days</span>
                            <span className="text-[10px] text-muted-foreground">Standard</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="7" id="d7" className="peer sr-only" />
                          <Label
                            htmlFor="d7"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                          >
                            <span className="text-lg font-bold">7 Days</span>
                            <span className="text-[10px] text-muted-foreground">Maximum reach</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Auctions automatically end after the selected period. The item will be sold to the highest bidder.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 bg-primary text-white font-bold h-12 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all">
                {isAuction ? <Gavel className="w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                {isAuction ? "Start Auction" : "Post Listing"}
              </Button>
              <Button type="button" variant="outline" className="h-12 rounded-xl px-8 border-primary text-primary" onClick={() => window.history.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
