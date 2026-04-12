
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
  Building2,
  Save
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
  
  const [isAuction, setIsAuction] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [isBusinessSeller, setIsBusinessSeller] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [auctionDuration, setAuctionDuration] = useState("3");
  const [cpaConsent, setCpaConsent] = useState(false);

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // INTERRUPT RECOVERY: Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("exchange_listing_v2");
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setTitle(data.title || "");
        setCategory(data.category || "");
        setCondition(data.condition || "");
        setPrice(data.price || "");
        setDescription(data.description || "");
        toast({ title: "Draft Restored", description: "Your previous progress was saved automatically." });
      } catch (e) {
        console.error("Draft load error", e);
      }
    }
  }, []);

  // INTERRUPT RECOVERY: Save draft on change
  useEffect(() => {
    const draftData = { title, category, condition, price, description };
    localStorage.setItem("exchange_listing_v2", JSON.stringify(draftData));
  }, [title, category, condition, price, description]);

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
      setLocation({ lat: -26.2041, lng: 28.0473, name: "Johannesburg, GP" });
      setLocationDetecting(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!cpaConsent) return;

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
    };

    const listingsCol = collection(db, "publicListings");
    addDocumentNonBlocking(listingsCol, listingData);

    localStorage.removeItem("exchange_listing_v2");
    
    setTimeout(() => {
      setLoading(false);
      router.push("/search");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-[#225BC3]">Create Listing</h1>
              <p className="text-muted-foreground text-sm font-medium">Verified professional and peer-to-peer trades.</p>
            </div>
            <div className="flex items-center gap-2 text-[#34CBED] bg-[#34CBED]/5 px-4 py-2 rounded-2xl border border-[#34CBED]/20">
              <Save className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Auto-Saving Draft</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-[#225BC3]">Item Photos ({images.length}/10)</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-white bg-white shadow-md group">
                    <Image src={img} alt="listing" fill className="object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {images.length < 10 && (
                  <button type="button" onClick={handleImageUpload} className="aspect-square rounded-[1.5rem] border-2 border-dashed border-[#225BC3]/20 bg-white flex flex-col items-center justify-center gap-1 hover:bg-[#225BC3]/5">
                    <ImagePlus className="w-6 h-6 text-[#225BC3]" />
                    <span className="text-[10px] font-black text-[#225BC3] uppercase">Add Photo</span>
                  </button>
                )}
              </div>
            </div>

            {aiSuggestion && (
              <div className="bg-[#34CBED]/10 p-4 rounded-2xl border border-[#34CBED]/20 flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                <Zap className="w-5 h-5 text-[#34CBED]" />
                <p className="text-xs font-bold text-[#225BC3]">{aiSuggestion}</p>
              </div>
            )}

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white ring-1 ring-[#225BC3]/5">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Listing Title</Label>
                  <Input id="title" placeholder="e.g. Mountain Bike" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {CATEGORIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {CONDITIONS.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Price (R)</Label>
                  <Input id="price" type="number" placeholder="0.00" className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Description</Label>
                  <Textarea id="desc" placeholder="Details..." className="min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-[1.5rem] bg-[#225BC3] text-white font-black text-lg shadow-2xl hover:scale-[1.02] transition-transform"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "List on The Exchange"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
