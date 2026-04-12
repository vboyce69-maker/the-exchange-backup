
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
import { Switch } from "@/components/ui/switch";
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
  Zap,
  Package,
  Gavel,
  AlertTriangle,
  Info,
  Layers,
  ImagePlus,
  Building2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { collection } from "firebase/firestore";
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

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  
  // Auction & Bulk States
  const [isAuction, setIsAuction] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [isBusinessSeller, setIsBusinessSeller] = useState(false);
  const [quantity, setQuantity] = useState("1");
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
          
          if (insights?.optimalListingCategories) {
            const optimal = insights.optimalListingCategories.find(c => 
              c.categoryName.toLowerCase().includes(category.toLowerCase())
            );
            if (optimal && optimal.demandScore > 80) {
              setAiSuggestion(`High Demand! 1-day auction recommended for this category in your area.`);
            } else {
              setAiSuggestion(`Standard demand. 3-7 day listing recommended.`);
            }
          }
        } catch (e) {
          console.error("AI Insight failed", e);
        }
      }
      checkDemand();
    }
  }, [category, location, user]);

  const handleImageUpload = () => {
    if (images.length >= 10) {
      toast({ variant: "destructive", title: "Limit Reached", description: "You can upload up to 10 photos." });
      return;
    }
    const nextId = Date.now();
    const newImage = `https://picsum.photos/seed/${nextId}/800/600`;
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
      isBulk,
      isBusinessSeller,
      quantity: parseInt(quantity),
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
      router.push("/search");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#225BC3]">Create Listing</h1>
            <p className="text-muted-foreground text-sm font-medium">Verified professional and peer-to-peer trades.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multi-Image Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-[#225BC3]">
                  Item Photos ({images.length}/10)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border rounded-xl p-3 shadow-xl max-w-[200px]">
                      <p className="text-[10px] font-bold leading-tight">Better photos increase sales by 40%. For bulk lots, include a photo of all items together.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-white bg-white shadow-md group">
                    <Image src={img} alt="listing" fill className="object-cover" data-ai-hint="product image" />
                    {i === 0 && (
                      <div className="absolute top-1 left-1 bg-[#225BC3] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-lg">Primary</div>
                    )}
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 10 && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="aspect-square rounded-[1.5rem] border-2 border-dashed border-[#225BC3]/20 bg-white hover:bg-[#225BC3]/5 hover:border-[#225BC3]/40 transition-all flex flex-col items-center justify-center gap-1"
                  >
                    <ImagePlus className="w-6 h-6 text-[#225BC3]" />
                    <span className="text-[10px] font-black text-[#225BC3] uppercase">Add Photo</span>
                  </button>
                )}
              </div>
            </div>

            {aiSuggestion && (
              <div className="bg-[#34CBED]/10 p-4 rounded-2xl border border-[#34CBED]/20 flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                <Zap className="w-5 h-5 text-[#34CBED] shrink-0" />
                <p className="text-xs font-bold text-[#225BC3]">{aiSuggestion}</p>
              </div>
            )}

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white ring-1 ring-[#225BC3]/5">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Listing Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Job Lot of 10 Samsung TVs" 
                    required 
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Business & Bulk Features */}
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#225BC3]">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-black text-[#225BC3] block uppercase text-[10px] tracking-widest leading-none mb-1">Business Seller</span>
                        <span className="text-[9px] text-muted-foreground font-bold">List as a registered company?</span>
                      </div>
                    </div>
                    <Switch checked={isBusinessSeller} onCheckedChange={setIsBusinessSeller} />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#225BC3]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-black text-[#225BC3] block uppercase text-[10px] tracking-widest leading-none mb-1">Bulk Lot</span>
                        <span className="text-[9px] text-muted-foreground font-bold">Selling multiple items together?</span>
                      </div>
                    </div>
                    <Switch checked={isBulk} onCheckedChange={setIsBulk} />
                  </div>

                  {isBulk && (
                    <div className="space-y-2 pt-4 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="qty" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Total Items in Lot</Label>
                      <Input 
                        id="qty" 
                        type="number" 
                        min="1"
                        className="h-12 rounded-xl bg-white border-none font-black"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                  )}
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
                    placeholder="Provide details about the item(s). For lots, list exactly what is included." 
                    className="min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none font-medium p-4"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white ring-1 ring-[#225BC3]/5">
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
                      <AlertTriangle className="w-3 h-3" /> Marketplace Rules
                    </h4>
                    <p className="text-[9px] font-bold text-orange-600 leading-tight">
                      Stolen or counterfeit goods are banned. All business sellers must adhere to the Consumer Protection Act. We support law enforcement in investigating high-value theft.
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
                      <label htmlFor="cpa" className="text-[10px] font-bold text-[#225BC3] font-body leading-relaxed cursor-pointer">
                        I confirm ownership and accuracy of this listing. As a seller on The Exchange, I am aware of my legal obligations under the CPA (2008) and POPIA (2013).
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
                  List on The Exchange
                </span>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
