"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  Zap,
  Loader2, 
  Camera,
  CreditCard,
  Lock,
  Award
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { collection, getCountFromServer } from "firebase/firestore";
import { useFirestore, useUser, useStorage } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Badge } from "@/components/ui/badge";
import { MARKET_CONFIG, isFoundingSlotAvailable } from "@/app/lib/market-config";
import { cn } from "@/lib/utils";

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  
  const [isAuction, setIsAuction] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [quantity, setQuantity] = useState("1");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [filledCount, setFilledCount] = useState(0);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        const coll = collection(db, "userProfiles");
        const snapshot = await getCountFromServer(coll);
        setFilledCount(snapshot.data().count);
      } catch (err) {
        console.error("Failed to fetch founding member count", err);
      }
    }
    fetchUserCount();
  }, [db]);

  const isFoundingMember = isFoundingSlotAvailable(filledCount);

  const handleListingCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setImages([...images, downloadURL]);
      toast({ title: "Photo Captured", description: "Item image added from camera." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Capture Error", description: "Could not upload live photo." });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (images.length === 0) {
      toast({ variant: "destructive", title: "Photos Required", description: "Please capture at least one photo of the item." });
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
      currency: MARKET_CONFIG.CURRENCY,
      imageUrls: images,
      listingLocationLatitude: location?.lat || 0,
      listingLocationLongitude: location?.lng || 0,
      postedDate: new Date().toISOString(),
      status: isAuction ? "auction_active" : "available",
      isAuction,
      isBulk,
      quantity: parseInt(quantity),
      viewCount: 0,
      isBoosted: isFoundingMember,
      feePaid: isFoundingMember ? 0 : MARKET_CONFIG.STANDARD_LISTING_FEE
    };

    const listingsCol = collection(db, "publicListings");
    addDocumentNonBlocking(listingsCol, listingData);
    
    setTimeout(() => {
      setLoading(false);
      toast({ 
        title: isFoundingMember ? "Founding Slot Claimed" : "Listing Live", 
        description: isFoundingMember 
          ? "Your listing is boosted and R0 fees applied." 
          : `Standard fee of R${MARKET_CONFIG.STANDARD_LISTING_FEE} charged.` 
      });
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
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Create Listing</h1>
              <p className="text-muted-foreground text-sm font-medium">Verified professional and peer-to-peer trades.</p>
            </div>
            {isFoundingMember && (
               <Badge className="bg-[#FF8C00] text-white px-4 py-1.5 rounded-xl border-none shadow-lg animate-pulse">
                  <Award className="w-3 h-3 mr-2" /> Founding 1000 Perk
               </Badge>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white ring-1 ring-[#225BC3]/5">
              <CardContent className="p-8 space-y-6">
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black uppercase tracking-widest text-[#225BC3]">Item Photos ({images.length}/10)</Label>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">In-App Camera Only</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-white bg-white shadow-md group">
                        <Image src={img} alt="listing" fill className="object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {images.length < 10 && (
                      <div className="relative">
                        <input 
                          type="file" 
                          ref={cameraInputRef}
                          className="hidden" 
                          accept="image/*" 
                          capture="environment"
                          onChange={handleListingCapture}
                        />
                        <button 
                          type="button" 
                          disabled={uploadingImage}
                          onClick={() => cameraInputRef.current?.click()} 
                          className="aspect-square w-full rounded-[1.5rem] border-2 border-dashed border-[#225BC3]/20 bg-white flex flex-col items-center justify-center gap-1 hover:bg-[#225BC3]/5 transition-all"
                        >
                          {uploadingImage ? (
                            <Loader2 className="w-6 h-6 text-[#225BC3] animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-[#225BC3]" />
                              <span className="text-[10px] font-black text-[#225BC3] uppercase">Capture</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Title</Label>
                  <Input id="title" placeholder="Listing Title" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Category</Label>
                    <Input id="category" placeholder="Category" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={category} onChange={(e) => setCategory(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Condition</Label>
                    <Input id="condition" placeholder="Condition" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={condition} onChange={(e) => setCondition(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Price (R)</Label>
                  <Input id="price" type="number" placeholder="0.00" className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc" className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest">Description</Label>
                  <Textarea id="desc" placeholder="Tell us about the item..." className="min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button 
                type="submit" 
                className={cn(
                  "w-full h-16 rounded-[1.5rem] text-white font-black text-lg shadow-2xl hover:scale-[1.02] transition-transform",
                  isFoundingMember ? "bg-[#225BC3]" : "bg-[#FF8C00]"
                )}
                disabled={loading || images.length === 0}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isFoundingMember ? "List for R0.00" : `List for R${MARKET_CONFIG.STANDARD_LISTING_FEE.toFixed(2)}`)}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
