"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Loader2,
  Camera,
  ShieldCheck,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import {
  useFirestore,
  useUser,
  useStorage,
  useDoc,
  useMemoFirebase,
} from "@/firebase";
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { MARKET_CONFIG, getListingLimit } from "@/app/lib/market-config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScamDetection } from "@/hooks/use-scam-detection";

export default function CreateListingPage() {
  return (
    <AuthGuard>
      <CreateListingContent />
    </AuthGuard>
  );
}

function CreateListingContent() {
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
  const [location, setLocation] = useState("");
  const [userListingCount, setUserListingCount] = useState(0);

  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "userProfiles", user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef as any);

  useEffect(() => {
    async function checkLimits() {
      if (!user || !db) return;
      const q = query(
        collection(db, "publicListings"),
        where("sellerId", "==", user.uid),
      );
      const snap = await getDocs(q);
      setUserListingCount(snap.size);
    }
    checkLimits();
  }, [user, db]);

  // Rescue photo if Android killed the WebView during camera capture
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = CapApp.addListener('appRestoredResult', async (data: any) => {
      if (data.pluginId !== 'Camera' || data.methodName !== 'getPhoto') return;
      if (!data.success || !data.data) return;

      // Strict TypeScript guard for Storage
      if (!storage || !user) return;

      const photo = data.data;
      try {
        setUploadingImage(true);
        const filePath = photo.path ?? photo.webPath;
        if (!filePath) throw new Error('No image path after restore');

        const safeUrl = Capacitor.convertFileSrc(filePath);
        const response = await fetch(safeUrl);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

        const blob = await response.blob();
        const storageRef = ref(storage, `listings/${user?.uid}/${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        setImages((prev) => [...prev, downloadURL]);

        toast({ title: "Live Photo Added", description: "In-app camera capture secured." });
      } catch (err: any) {
        console.error('Restored capture error:', err);
        toast({ variant: "destructive", title: "Capture Error", description: err.message || 'Could not upload photo' });
      } finally {
        setUploadingImage(false);
      }
    });

    return () => {
      listenerPromise.then(l => l.remove());
    };
  }, [user, storage]);

  const maxListings = getListingLimit(profile);
  const isLimitReached = userListingCount >= maxListings;

  const handleListingCapture = async () => {
    if (!user || !storage) return;
    try {
      setUploadingImage(true);
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');

      // 1. Force base64 data capture to completely bypass Android local file:// sandbox limits
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 70,
      });

      if (!photo.base64String) throw new Error('No image base64 data received');

      // 2. Render the preview UI instantly using the raw base64 data string
      const localPreviewUrl = `data:image/jpeg;base64,${photo.base64String}`;

      // 3. Construct a standard data-blob instance safely
      const rawResponse = await fetch(localPreviewUrl);
      const blob = await rawResponse.blob();

      // 4. Generate the target Storage bucket directory reference path
      const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}.jpg`);

      // 5. Explicitly await the complete byte upload cycle before pushing any URLs
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // 6. Push the verified, live Firebase download URL to your UI listing array
      setImages((prev) => [...prev, downloadURL]);

      toast({
        title: "Live Photo Added",
        description: "In-app camera capture secured."
      });
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.message?.includes('canceled')) return;
      console.error('Capture Error:', err);
      toast({
        variant: "destructive",
        title: "Capture Error",
        description: String(err?.message || 'Could not upload live photo.')
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || isLimitReached) return;
    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "Photos Required",
        description: "Use the in-app camera to take a photo.",
      });
      return;
    }

    setLoading(true);

    const validationResult = await checkContent(
      `${title} ${description}`,
      "listing"
    );

    if (validationResult?.decision === "block") {
      setLoading(false);
      return;
    }

    const listingData = {
      sellerId: user.uid,
      categoryId: category.toLowerCase().replace(/\s+/g, "-"),
      title,
      description,
      condition,
      location: location || "Local",
      price: parseFloat(price),
      currency: MARKET_CONFIG.CURRENCY,
      imageUrls: images,
      postedDate: new Date().toISOString(),
      status: validationResult?.decision === "warn" ? "pending_review" : "available",
      isVerified: profile?.kycStatus === "verified",
      trustScore: profile?.trustScore || 50,
      riskFlags: validationResult?.audit.matchedRules || [],
    };

    addDocumentNonBlocking(collection(db, "publicListings"), listingData);

    setTimeout(() => {
      setLoading(false);
      toast({
        title: listingData.status === "available" ? "Listing Live" : "Sent for Review",
        description: listingData.status === "available" ? "Your item is visible to buyers." : "Validation required for high-risk flags.",
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
                <Badge className="bg-[#225BC3] text-white border-none font-black text-[8px] uppercase px-3 py-1">
                  V1 Listing Service
                </Badge>
                {profile?.kycStatus === "verified" && (
                  <Badge className="bg-green-100 text-green-700 border-none font-black text-[8px] uppercase px-3 py-1 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">
                Post Listing
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Capacity
              </p>
              <Badge
                variant="outline"
                className="border-slate-200 text-slate-600 font-black text-[10px] uppercase"
              >
                {userListingCount} / {maxListings === 99999 ? "∞" : maxListings}
              </Badge>
            </div>
          </div>

          {isLimitReached && (
            <Alert
              variant="destructive"
              className="mb-8 rounded-[2rem] border-none shadow-xl bg-white ring-2 ring-red-100"
            >
              <ShieldAlert className="w-5 h-5" />
              <AlertTitle className="font-black uppercase text-[10px] tracking-widest">
                Listing Limit Reached
              </AlertTitle>
              <AlertDescription className="text-xs font-medium leading-relaxed">
                {profile?.kycStatus === "verified"
                  ? "You have reached your individual seller limit (10). Upgrade to a Business profile for unlimited professional trading."
                  : "Unverified sellers are limited to 3 listings. Verify your identity in the Seller Hub to unlock 10 listings."}
                <Button
                  variant="link"
                  className="p-0 h-auto font-black text-[#225BC3] ml-1"
                  onClick={() => router.push("/verify")}
                >
                  Seller Hub
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-[#225BC3]">
                    Item Photos ({images.length}/10)
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md"
                      >
                        <Image
                          src={img}
                          alt="listing"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImages(images.filter((_, idx) => idx !== i))
                          }
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 10 && !isLimitReached && (
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={handleListingCapture}
                        className="aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 hover:bg-slate-100 transition-all"
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#225BC3]" />
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-slate-400" />
                            <span className="text-[8px] font-black uppercase text-slate-400">
                              Capture
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">
                    In-App Camera Capture Required
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                    Title
                  </Label>
                  <Input
                    placeholder="What are you selling?"
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLimitReached}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                      Price (R)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isLimitReached}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                      Condition
                    </Label>
                    <Input
                      placeholder="New/Used"
                      className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      disabled={isLimitReached}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="e.g. Sandton, GP"
                      className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={isLimitReached}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Details, specs, or lot info..."
                    className="min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none font-medium"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLimitReached}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-[#225BC3]/5 rounded-[2rem] border border-[#225BC3]/10 space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#225BC3]" />
                <span className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">
                  Verification Engine v1
                </span>
              </div>
              <p className="text-[9px] text-slate-500 font-bold leading-relaxed">
                All listings are scanned for price anomalies, duplicated
                imagery, and scam patterns. High-risk items may be held for
                review.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-16 rounded-3xl bg-[#225BC3] text-white font-black text-lg shadow-xl disabled:opacity-50"
              disabled={
                loading || images.length === 0 || isLimitReached || isValidating
              }
            >
              {loading || isValidating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Initiate Listing"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}