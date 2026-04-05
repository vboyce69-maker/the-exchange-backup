
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Gavel
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { collection, doc } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleImageUpload = () => {
    if (images.length >= 6) {
      toast({ variant: "destructive", title: "Limit Reached", description: "You can upload up to 6 photos." });
      return;
    }
    // Simulate upload
    const nextId = images.length + 1;
    const newImage = `https://picsum.photos/seed/upload-${nextId}/600/400`;
    setImages([...images, newImage]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const detectLocation = () => {
    setLocationDetecting(true);
    // Simulate browser geolocation
    setTimeout(() => {
      setLocation({
        lat: -26.2041,
        lng: 28.0473,
        name: "Johannesburg, GP"
      });
      setLocationDetecting(false);
      toast({ title: "Location Detected", description: "Johannesburg, Central" });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please sign in to list an item." });
      return;
    }

    if (images.length === 0) {
      toast({ variant: "destructive", title: "Photos Required", description: "Add at least one photo of your item." });
      return;
    }

    setLoading(true);

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
      status: isAuction ? "auction_active" : "available",
      isAuction,
      viewCount: 0,
      isBoosted: false,
      negotiable: true,
    };

    const listingsCol = collection(db, "publicListings");
    addDocumentNonBlocking(listingsCol, listingData);

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Listing Posted!",
        description: "Your item is now live and visible to local buyers.",
      });
      router.push("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sell an Item</h1>
              <p className="text-muted-foreground mt-1">Ready to list in 60 seconds.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Simple Flow</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photos Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">Photos ({images.length}/6)</Label>
                <span className="text-xs text-muted-foreground">Add clear photos for more sales</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border bg-white group shadow-sm">
                    <Image src={img} alt="listing" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 6 && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="aspect-square rounded-2xl border-2 border-dashed border-primary/20 bg-white hover:bg-primary/5 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-primary">Add Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <Card className="rounded-3xl border shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-bold">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Samsung 55” TV" 
                    required 
                    className="h-12 rounded-xl"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Condition</Label>
                    <Select value={condition} onValueChange={setCondition} required>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="font-bold">Price (R)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R</span>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0.00" 
                      required 
                      className="h-12 pl-8 rounded-xl font-bold"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc" className="font-bold">Description</Label>
                  <Textarea 
                    id="desc" 
                    placeholder="Tell us more about the item..." 
                    className="min-h-[120px] rounded-xl resize-none"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Auction */}
            <Card className="rounded-3xl border shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-bold">Location</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary font-bold hover:bg-primary/5"
                    onClick={detectLocation}
                    disabled={locationDetecting}
                  >
                    {locationDetecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {location ? location.name : "Detect Location"}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-bold block">Sell via Auction</span>
                      <span className="text-[10px] text-muted-foreground">Sell to the highest bidder</span>
                    </div>
                  </div>
                  <Button 
                    type="button"
                    variant={isAuction ? "default" : "outline"}
                    className={cn("rounded-full h-8 px-4 font-bold text-xs transition-all", isAuction ? "bg-primary" : "border-primary text-primary")}
                    onClick={() => setIsAuction(!isAuction)}
                  >
                    {isAuction ? "Active" : "Disabled"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Post Listing
                </span>
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              By posting, you agree to our Terms of Service and Safety Guidelines.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
