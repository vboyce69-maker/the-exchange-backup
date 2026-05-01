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
  ShieldAlert,
  Info,
  ShieldCheck
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { useFirestore, useUser, useStorage, useDoc, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Badge } from "@/components/ui/badge";
import { MARKET_CONFIG, getListingLimit } from "@/app/lib/market-config";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScamDetection } from "@/hooks/use-scam-detection";

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { checkContent, isValidating } = useScamDetection();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [userListingCount, setUserListingCount] = useState(0);

  const profileRef = useMemoFirebase(() => user ? doc(db, "userProfiles", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef as any);

  useEffect(() => {
    async function checkLimits() {
      if (!user) return;
      const q = query(collection(db, "publicListings"), where("sellerId", "==", user.uid));
      const snap = await getDocs(q);
      setUserListingCount(snap.size);
    }
    checkLimits();
  }, [user, db]);

  const maxListings = getListingLimit(profile);
  const isLimitReached = userListingCount >= maxListings;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isLimitReached) return;
    if (images.length === 0) {
      toast({ variant: "destructive", title: "Photos Required", description: "Use the in-app camera to take a photo." });
      return;
    }

    setLoading(true);

    // INTERNAL VALIDATION PIPELINE
    const validationResult = await checkContent(`${title} ${description}`, 'listing');
    
    if (validationResult?.decision === 'block') {
      setLoading(false);
      return; // Error message handled by hook
    }

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
      status: validationResult?.decision === 'warn' ? "pending_review" : "available",
      isVerified: profile?.kycStatus === 'verified',
      trustScore: profile?.trustScore || 50,
      riskFlags: validationResult?.audit.matchedRules || []
    };

    addDocumentNonBlocking(collection(db, "publicListings"), listingData);
    
    setTimeout(() => {
      setLoading(false);
      toast({ 
        title: listingData.status === 'available' ? "Listing Live" : "Sent for Review", 
        description: listingData.status === 'available' ? "Your item is visible to buyers." : "Validation required for high-risk flags." 
      });
      router.push("/search");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12 flex justify-center">
        <div className="w-full max-w-xl">
          
          <div className="mb-8 flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <Badge className="bg-[#225BC3] text-white border-none font-black text-[8px] uppercase px-3 py-1">V1 Listing Service</Badge>
                 {profile?.kycStatus === 'verified' && <Badge className="bg-green-100 text-green-700 border-none font-black text-[8px] uppercase px-3 py-1 flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Verified</Badge>}
              </div>
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Post Listing</h1>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
               <Badge variant="outline" className="border-slate-200 text-slate-600 font-black text-[10px] uppercase">
                 {userListingCount} / {maxListings === 99999 ? '∞' : maxListings}
               </Badge>
            </div>
          </div>

          {isLimitReached && (
            <Alert variant="destructive" className="mb-8 rounded-[2rem] border-none shadow-xl bg-white ring-2 ring-red-100">
               <ShieldAlert className="w-5 h-5" />
               <AlertTitle className="font-black uppercase text-[10px] tracking-widest">Listing Limit Reached</AlertTitle>
               <AlertDescription className="text-xs font-medium leading-relaxed">
                 {profile?.kycStatus === 'verified' 
                   ? "You have reached your individual seller limit (10). Upgrade to a Business profile for unlimited professional trading."
                   : "Unverified sellers are limited to 3 listings. Verify your identity in the Seller Hub to unlock 10 listings."}
                 <Button variant="link" className="p-0 h-auto font-black text-[#225BC3] ml-1" onClick={() => router.push('/verify')}>Seller Hub</Button>
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
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">In-App Camera Capture Required</p>
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
                  <Textarea placeholder="Details, specs, or lot info..." className="min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none font-medium" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLimitReached} />
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-[#225BC3]/5 rounded-[2rem] border border-[#225BC3]/10 space-y-3">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#225BC3]" />
                  <span className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Verification Engine v1</span>
               </div>
               <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                 All listings are scanned for price anomalies, duplicated imagery, and scam patterns. High-risk items may be held for review.
               </p>
            </div>

            <Button type="submit" className="w-full h-16 rounded-3xl bg-[#225BC3] text-white font-black text-lg shadow-xl disabled:opacity-50" disabled={loading || images.length === 0 || isLimitReached || isValidating}>
              {loading || isValidating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate Listing"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
