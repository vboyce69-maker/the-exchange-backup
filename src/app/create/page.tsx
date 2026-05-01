
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
  AlertTriangle,
  Lock,
  Award,
  ShieldAlert
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { collection, getCountFromServer, query, where, getDocs } from "firebase/firestore";
import { useFirestore, useUser, useStorage, useDoc, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Badge } from "@/components/ui/badge";
import { MARKET_CONFIG, isFoundingSlotAvailable } from "@/app/lib/market-config";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [userListingCount, setUserListingCount] = useState(0);

  const profileRef = useMemoFirebase(() => user ? query(collection(db, "userProfiles"), where("id", "==", user.uid)) : null, [db, user]);
  const { data: profiles } = useDoc(profileRef as any);
  const profile = profiles?.[0];

  useEffect(() => {
    async function checkLimits() {
      if (!user) return;
      const q = query(collection(db, "publicListings"), where("sellerId", "==", user.uid));
      const snap = await getDocs(q);
      setUserListingCount(snap.size);
    }
    checkLimits();
  }, [user, db]);

  const isVerified = profile?.isIdVerified === true;
  const isLimitReached = !isVerified && userListingCount >= MARKET_CONFIG.MAX_UNVERIFIED_LISTINGS;

  const handleListingCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setImages([...images, downloadURL]);
      toast({ title: "Live Photo Added", description: "In-app camera capture secured." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Capture Error", description: "Could not upload live photo." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isLimitReached) return;
    if (images.length === 0) {
      toast({ variant: "destructive", title: "Photos Required", description: "Use the in-app camera to take a photo of the item." });
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
      postedDate: new Date().toISOString(),
      status: "available",
      isVerified,
      trustScore: profile?.trustScore || 50
    };

    addDocumentNonBlocking(collection(db, "publicListings"), listingData);
    
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Listing Live", description: "Your item is now visible to buyers." });
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
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">List Item</h1>
              <p className="text-muted-foreground text-sm font-medium">Capture & sell in under 60 seconds.</p>
            </div>
            {!isVerified && (
               <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[9px] uppercase px-3 py-1">
                 Limit: {userListingCount}/{MARKET_CONFIG.MAX_UNVERIFIED_LISTINGS} Used
               </Badge>
            )}
          </div>

          {isLimitReached && (
            <Alert variant="destructive" className="mb-8 rounded-3xl border-none shadow-xl bg-white ring-2 ring-red-100">
               <ShieldAlert className="w-5 h-5" />
               <AlertTitle className="font-black uppercase text-[10px] tracking-widest">Listing Limit Reached</AlertTitle>
               <AlertDescription className="text-xs font-medium leading-relaxed">
                 Unverified sellers are limited to 3 listings. Complete your identity verification to unlock unlimited professional trading.
                 <Button variant="link" className="p-0 h-auto font-black text-red-600 ml-1" onClick={() => router.push('/verify')}>Verify Now</Button>
               </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
              <CardContent className="p-8 space-y-6">
                
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-[#225BC3]">Item Photos ({images.length}/10)</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md">
                        <Image src={img} alt="listing" fill className="object-cover" />
                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {images.length < 10 && !isLimitReached && (
                      <button 
                        type="button" 
                        disabled={uploadingImage}
                        onClick={() => cameraInputRef.current?.click()} 
                        className="aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 hover:bg-slate-100 transition-all"
                      >
                        {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin text-[#225BC3]" /> : <><Camera className="w-5 h-5 text-slate-400" /><span className="text-[8px] font-black uppercase text-slate-400">Capture</span></>}
                        <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleListingCapture} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">Title</Label>
                  <Input placeholder="What are you selling?" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLimitReached} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase text-[#225BC3]">Price (R)</Label>
                    <Input type="number" placeholder="0.00" className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isLimitReached} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase text-[#225BC3]">Condition</Label>
                    <Input placeholder="New/Used" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={condition} onChange={(e) => setCondition(e.target.value)} disabled={isLimitReached} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">Description</Label>
                  <Textarea placeholder="Details, specs, or lot info..." className="min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLimitReached} />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-16 rounded-3xl bg-[#225BC3] text-white font-black text-lg shadow-xl disabled:opacity-50" disabled={loading || images.length === 0 || isLimitReached}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Post Listing Live"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
