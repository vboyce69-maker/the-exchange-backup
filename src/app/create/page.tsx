
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Camera, 
  MapPin, 
  Loader2, 
  X, 
  CheckCircle2, 
  Zap,
  Package,
  Gavel,
  TrendingUp,
  Info,
  Scale,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { collection, doc } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getSellerDemandInsights } from "@/ai/flows/seller-demand-insights";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CATEGORIES = [
  "Vehicles", "Electronics", "Real Estate", "Clothing", 
  "Sneakers", "Jewelry", "Sports", "Home & Garden", 
  "Business Services", "Misc"
];

const CONDITIONS = ["New", "Like new", "Good", "Used"];
const DURATIONS = [
  { value: "1", label: "1 Day (Fast Sale)" },
  { value: "3", label: "3 Days (Balanced)" },
  { value: "7", label: "7 Days (Max Reach)" }
];

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isAuction, setIsAuction] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState("3");
  const [cpaConsent, setCpaConsent] = useState(false);

  // AI Suggestions
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category && location) {
      async function checkDemand() {
        try {
          const insights = await getSellerDemandInsights({
            sellerId: user?.uid || "anon",
            currentListingsCategories: [category],
            sellerLocation: { latitude: location!.lat, longitude: location!.lng }
          });
          const optimal = insights.optimalListingCategories.find(c => c.categoryName.toLowerCase().includes(category.toLowerCase()));
          if (optimal && optimal.demandScore > 80) {
            setAiSuggestion(`High Demand! 1-day auction recommended for this category in your area.`);
          } else {
            setAiSuggestion(`Standard demand. 3-7 day listing recommended.`);
          }
        } catch (e) {
          console.error("AI Insight failed", e);
        }
      }
      checkDemand();
    }
  }, [category, location, user]);

  const handleImageUpload = () => {
    if (images.length >= 6) {
      toast({ variant: "destructive", title: "Limit Reached", description: "You can upload up to 6 photos." });
      return;
    }
    const nextId = images.length + 1;
    const newImage = `https://picsum.photos/seed/upload-${nextId}/600/400`;
    setImages([...images, newImage]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const detectLocation = () => {
    setLocationDetecting(true);
    setTimeout(() => {
      setLocation({
        lat: -26.2041,
        lng: 28.0473,
        name: "Johannesburg, GP"
      });
      setLocationDetecting(false);
      toast({ title: "Location Detected", description: "Johannesburg, GP" });
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please sign in to list an item." });
      return;
    }

    if (!cpaConsent) {
      toast({ variant: "destructive", title: "Compliance Required", description: "Please accept the seller declaration." });
      return;
    }

    if (images.length === 0) {
      toast({ variant: "destructive", title: "Photos Required", description: "Add at least one photo of your item." });
      return;
    }

    setLoading(true);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(auctionDuration));

    const listingData = {
      sellerId: user.uid,
      categoryId: category.toLowerCase().replace(/\s+/g, '-'),
      title,
      description,
      condition,
      price: parseFloat(price),
      currency: "ZAR",
      imageUrls: images,
      listingLocationLatitude: location?.lat || 0,
      listingLocationLongitude: location?.lng || 0,
      postedDate: new Date().toISOString(),
      auctionEndDate: isAuction ? endDate.toISOString() : null,
      status: isAuction ? "auction_active" : "available",
      isAuction,
      viewCount: 0,
      isBoosted: false,
      negotiable: !isAuction,
      cpaDeclaration: true,
    };

    const listingsCol = collection(db, "publicListings");
    addDocumentNonBlocking(listingsCol, listingData);

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Listing Posted!",
        description: isAuction ? `Auction live for ${auctionDuration} days!` : "Your item is now live.",
      });
      router.push("/auctions");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#225BC3]">Sell an Item</h1>
              <p className="text-muted-foreground text-sm font-medium">List your items in the premium exchange.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Photos ({images.length}/6)</Label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-white bg-white shadow-md group">
                    <Image src={img} alt="listing" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 6 && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="aspect-square rounded-[1.5rem] border-2 border-dashed border-[#225BC3]/20 bg-white hover:bg-[#225BC3]/5 hover:border-[#225BC3]/40 transition-all flex flex-col items-center justify-center gap-1"
                  >
                    <Camera className="w-6 h-6 text-[#225BC3]" />
                    <span className="text-[10px] font-black text-[#225BC3] uppercase">Add Photo</span>
                  </button>
                )}
              </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white ring-1 ring-[#225BC3]/5">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Samsung 55” TV" 
                    required 
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Condition</Label>
                    <Select value={condition} onValueChange={setCondition} required>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {CONDITIONS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Price (R)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#225BC3]">R</span>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0.00" 
                      required 
                      className="h-14 pl-10 rounded-2xl bg-slate-50 border-none font-black text-lg"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Description</Label>
                  <Textarea 
                    id="desc" 
                    placeholder="Tell us about your item..." 
                    className="min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none font-medium p-4"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-[#225BC3]/5">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#34CBED]/10 flex items-center justify-center text-[#34CBED]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-[#225BC3] block uppercase text-[10px] tracking-widest">Location</span>
                      <span className="text-xs text-muted-foreground font-bold">{location ? location.name : "Not detected"}</span>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-[#34CBED] font-black text-xs hover:bg-[#34CBED]/5"
                    onClick={detectLocation}
                    disabled={locationDetecting}
                  >
                    {locationDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Auto-Detect"}
                  </Button>
                </div>

                <div className="pt-6 border-t space-y-6">
                  <div className="p-5 bg-orange-50 rounded-[2rem] border border-orange-100 space-y-3">
                    <h4 className="font-black text-orange-700 uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> Prohibited Items
                    </h4>
                    <p className="text-[9px] font-bold text-orange-600 leading-tight">
                      You may NOT list stolen goods, counterfeit brands, unlawful substances, or dangerous weapons. We report suspicious behavior to SAPS.
                    </p>
                  </div>

                  <div className="p-5 bg-[#225BC3]/5 rounded-[2rem] border border-[#225BC3]/10 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="cpa" 
                        className="mt-1" 
                        checked={cpaConsent}
                        onCheckedChange={(checked) => setCpaConsent(checked === true)}
                      />
                      <label htmlFor="cpa" className="text-[10px] font-bold text-[#225BC3] leading-relaxed cursor-pointer">
                        SELLER DECLARATION: By posting this listing, I confirm that I am the legal owner of this item; it is not stolen or counterfeit; and the description/price are accurate. I acknowledge my liability under the Consumer Protection Act (2008) for misrepresentation.
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-[1.5rem] bg-[#225BC3] text-white font-black text-lg shadow-2xl shadow-[#225BC3]/20 hover:scale-[1.02] transition-transform"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Post to The Exchange
                </span>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
