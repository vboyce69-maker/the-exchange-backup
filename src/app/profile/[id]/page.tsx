
"use client";

import { useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Loader2,
  Package,
  Quote,
  Smartphone,
  MapPin,
  ScanFace,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  History,
  Zap,
  Fingerprint,
  Camera,
  Award
} from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SellerTierBadge, SellerTier } from "@/components/SellerTierBadge";
import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser, useStorage } from "@/firebase";
import { doc, collection, query, where, orderBy, updateDoc, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const storage = useStorage();
  const { user: authUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isBoostingId, setIsBoostingId] = useState<string | null>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "userProfiles", id as string);
  }, [db, id]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const userListingsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(collection(db, "publicListings"), where("sellerId", "==", id), orderBy("postedDate", "desc"));
  }, [db, id]);

  const { data: listings, isLoading: isListingsLoading } = useCollection(userListingsQuery);

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(collection(db, "userProfiles", id as string, "reviews"), orderBy("createdAt", "desc"));
  }, [db, id]);

  const { data: reviews, isLoading: isReviewsLoading } = useCollection(reviewsQuery);

  const isOwner = authUser?.uid === id;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser || !db || !storage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profile_pics/${authUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(authUser, { photoURL: downloadURL });
      await updateDoc(doc(db, "userProfiles", authUser.uid), { profileImageUrl: downloadURL });

      toast({ title: "Avatar Updated", description: "Identity persistence complete." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBoostListing = async (listingId: string) => {
    if (!db || !isOwner) return;
    setIsBoostingId(listingId);
    try {
      const listingRef = doc(db, "publicListings", listingId);
      await updateDoc(listingRef, {
        isBoosted: true,
        boostedAt: new Date().toISOString()
      });
      toast({ title: "Visibility Maxed!", description: "Item pushed to the top of the market." });
    } catch (err) {
      toast({ variant: "destructive", title: "Boost Failed", description: "Platform sync delay. Try again." });
    } finally {
      setIsBoostingId(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!authUser || !db || !id || !reviewComment) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, "userProfiles", id as string, "reviews"), {
        reviewerId: authUser.uid,
        rating,
        comment: reviewComment,
        createdAt: serverTimestamp()
      });

      // Recalculate Trust Score (Simulation of server logic)
      const currentScore = profile?.reliabilityScore || 50;
      const newScore = Math.min(100, Math.max(0, currentScore + (rating >= 4 ? 2 : -10)));
      await updateDoc(doc(db, "userProfiles", id as string), {
        reliabilityScore: newScore,
        transactionsCompleted: (profile?.transactionsCompleted || 0) + 1
      });

      setReviewComment("");
      toast({ title: "Review Published", description: "Your feedback has updated the seller's trust score." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not publish review." });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#EEF1F3] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" />
      </div>
    );
  }

  const user = profile || { firstName: "Verified", lastName: "Trader", reliabilityScore: 50, transactionsCompleted: 0 };
  const sellerTier = (user.transactionsCompleted || 0) >= 50 ? 'pro' : (user.transactionsCompleted || 0) >= 10 ? 'trusted' : 'beginner';

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-10 ring-1 ring-[#225BC3]/5">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-36 h-36 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative group">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback className="bg-[#225BC3] text-white font-black text-5xl flex items-center justify-center leading-none rounded-none">
                        {user.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isOwner && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm" onClick={() => fileInputRef.current?.click()}>
                        {isUploading ? <Loader2 className="w-10 h-10 animate-spin text-white" /> : <Camera className="w-10 h-10 text-white" />}
                      </div>
                    )}
                  </div>
                  {isOwner && <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />}
                </div>
                
                <h1 className="text-2xl font-black text-[#225BC3] uppercase tracking-tighter mb-2">{user.firstName} {user.lastName}</h1>
                <div className="flex flex-col items-center gap-3 mb-8">
                   <VerifiedBadge />
                   <SellerTierBadge level={sellerTier} />
                </div>

                <div className="w-full p-6 bg-slate-50 rounded-3xl space-y-4 text-left">
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Trust Gauge</p>
                      <span className="text-xl font-black text-[#225BC3]">{user.reliabilityScore}%</span>
                   </div>
                   <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                      <div className="h-full bg-[#225BC3] transition-all" style={{ width: `${user.reliabilityScore}%` }} />
                   </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6">
              <div className="flex justify-between items-center px-2">
                 <button onClick={() => setActiveTab('active')} className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", activeTab === 'active' ? 'text-[#225BC3]' : 'text-slate-400')}><TrendingUp className="w-4 h-4" /> Performance</button>
                 <button onClick={() => setActiveTab('reviews')} className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", activeTab === 'reviews' ? 'text-[#FF8C00]' : 'text-slate-400')}><Star className="w-4 h-4" /> Reviews</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Trades</p>
                    <p className="text-2xl font-black text-slate-900">{user.transactionsCompleted || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Disputes</p>
                    <p className="text-2xl font-black text-red-600">{user.disputeCount || 0}</p>
                  </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white rounded-3xl p-1.5 h-16 w-full lg:w-fit shadow-xl">
                <TabsTrigger value="active" className="rounded-2xl px-10 h-full font-black uppercase text-xs">Market Inventory</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-2xl px-10 h-full font-black uppercase text-xs">Verified Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {listings?.map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      {...listing} 
                      sellerName={`${user.firstName}`} 
                      isVerified={true} 
                      isOwner={isOwner}
                      onBoost={() => handleBoostListing(listing.id)}
                    />
                  ))}
                  {(isListingsLoading) && <div className="col-span-2 py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-200" /></div>}
                  {listings?.length === 0 && !isListingsLoading && <div className="col-span-2 py-32 text-center opacity-30"><Package className="w-16 h-16 mx-auto mb-4" /><p className="font-black uppercase text-xs tracking-widest">No listings found</p></div>}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-10 space-y-8">
                {!isOwner && (
                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6 ring-2 ring-[#225BC3]/5">
                     <h3 className="text-xl font-black text-[#225BC3] uppercase tracking-tighter">Submit Verified Feedback</h3>
                     <div className="space-y-4">
                        <div className="flex gap-2">
                           {[1,2,3,4,5].map(s => (
                             <button key={s} onClick={() => setRating(s)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", rating >= s ? "bg-[#FF8C00] text-white shadow-lg" : "bg-slate-100 text-slate-300")}>
                               <Star className={cn("w-5 h-5", rating >= s && "fill-current")} />
                             </button>
                           ))}
                        </div>
                        <Textarea placeholder="Share your trade experience..." className="rounded-2xl bg-slate-50 border-none min-h-[100px]" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                        <Button className="w-full bg-[#225BC3] text-white font-black h-14 rounded-2xl shadow-xl" onClick={handleSubmitReview} disabled={isSubmittingReview || !reviewComment}>
                           {isSubmittingReview ? <Loader2 className="w-6 h-6 animate-spin" /> : "Publish Feedback"}
                        </Button>
                     </div>
                  </Card>
                )}

                {reviews?.map((review) => (
                  <Card key={review.id} className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("w-4 h-4", i < review.rating ? "text-[#FF8C00] fill-current" : "text-slate-100")} />
                          ))}
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 font-medium italic text-lg leading-relaxed">"{review.comment}"</p>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
