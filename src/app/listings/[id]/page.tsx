"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  CreditCard,
  Building2,
  SmartphoneNfc,
  Lock,
  Gavel,
  FileText,
  ArrowLeft,
  ShieldAlert,
  Clock,
  Loader2,
  Zap,
  Bell,
  BellOff,
  Tag,
  HandCoins,
  Flag,
} from "lucide-react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
  useCollection,
} from "@/firebase";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const PAYMENT_METHODS = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, American Express",
  },
  {
    id: "capitec",
    name: "Capitec Pay",
    icon: SmartphoneNfc,
    description: "Fastest bank checkout in SA",
  },
  {
    id: "eft",
    name: "Instant EFT (Ozow)",
    icon: Building2,
    description: "Directly from your bank account",
  },
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isEditPriceOpen, setIsEditPriceOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPaying, setIsPaying] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const listingRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "publicListings", id as string);
  }, [db, id]);

  const { data: listing, isLoading } = useDoc(listingRef);

  const followQuery = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return query(
      collection(db, "follows"),
      where("userId", "==", user.uid),
      where("listingId", "==", id),
    );
  }, [db, user, id]);

  const { data: followDocs } = useCollection(followQuery);

  useEffect(() => {
    setIsFollowing(!!followDocs && followDocs.length > 0);
  }, [followDocs]);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const isSeller = user?.uid === listing?.sellerId;
  const isAuctionEnded = useMemo(() => {
    if (!listing?.isAuction || !listing?.auctionEndDate || !now) return false;
    return new Date(listing.auctionEndDate) <= now;
  }, [listing, now]);

  const timeLeft = useMemo(() => {
    if (!listing?.auctionEndDate || !now) return "";
    const diff = new Date(listing.auctionEndDate).getTime() - now.getTime();
    if (diff <= 0) return "Auction Ended";
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m remaining`;
  }, [listing, now]);

  const handleToggleFollow = async () => {
    if (!user || !db || !id) {
      toast({
        variant: "destructive",
        title: "Sign In Required",
        description: "Login to watch price drops.",
      });
      return;
    }

    setIsFollowLoading(true);
    try {
      if (isFollowing && followDocs?.[0]) {
        await deleteDoc(doc(db, "follows", followDocs[0].id));
        toast({
          title: "Price Watch Disabled",
          description: "You will no longer receive alerts for this item.",
        });
      } else {
        await addDoc(collection(db, "follows"), {
          userId: user.uid,
          listingId: id,
          initialPrice: listing?.price || 0,
          createdAt: new Date().toISOString(),
        });
        toast({
          title: "Watching for Price Drops",
          description: "We'll notify you if the price decreases.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update follow status.",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    const updatedPrice = parseFloat(newPrice);
    if (!db || !id || isNaN(updatedPrice) || updatedPrice <= 0 || !listing)
      return;

    setIsUpdatingPrice(true);
    try {
      const isPriceDrop = updatedPrice < listing.price;
      const listingDocRef = doc(db, "publicListings", id as string);

      await updateDoc(listingDocRef, { price: updatedPrice });

      if (isPriceDrop) {
        // Find followers to notify
        const followsQ = query(
          collection(db, "follows"),
          where("listingId", "==", id),
        );
        const followersSnap = await getDocs(followsQ);

        const batch = writeBatch(db);
        followersSnap.docs.forEach((fDoc) => {
          const followData = fDoc.data();
          const notifyRef = doc(collection(db, "notifications"));
          batch.set(notifyRef, {
            userId: followData.userId,
            listingId: id,
            type: "price_drop",
            title: "Price Drop Alert! 💸",
            message: `The item "${listing.title}" just dropped to R ${updatedPrice.toLocaleString()}!`,
            timestamp: serverTimestamp(),
            isRead: false,
          });
        });
        await batch.commit();
        toast({
          title: "Price Updated",
          description: "Followers have been notified of the price drop.",
        });
      } else {
        toast({
          title: "Price Updated",
          description: "Market listing adjusted.",
        });
      }

      setIsEditPriceOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Platform sync error.",
      });
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const handleStartChat = async () => {
    if (!db || !listing || !user) return;
    try {
      const q = query(
        collection(db, "chatThreads"),
        where("listingId", "==", id),
        where("participants", "array-contains", user.uid),
      );
      const snap = await getDocs(q);
      let threadId = snap.empty
        ? (
            await addDoc(collection(db, "chatThreads"), {
              listingId: id,
              listingTitle: listing.title,
              participants: [user.uid, listing.sellerId],
              updatedAt: serverTimestamp(),
              lastMessage: "手 Handshake established.",
            })
          ).id
        : snap.docs[0].id;
      router.push(`/messages?thread=${threadId}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not open chat.",
      });
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" />
      </div>
    );
  if (!listing) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="font-bold text-slate-500 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-3">
            {!isSeller && (
              <Button
                variant={isFollowing ? "default" : "outline"}
                className={cn(
                  "rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 h-11 px-6 transition-all",
                  isFollowing
                    ? "bg-primary text-white"
                    : "border-slate-200 text-slate-500 hover:text-primary",
                )}
                onClick={handleToggleFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <BellOff className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {isFollowing ? "Unwatch Price" : "Watch Price Drop"}
              </Button>
            )}
            {isSeller && (
              <Button
                className="bg-[#225BC3] text-white font-black rounded-xl h-11 px-6 uppercase text-[10px] tracking-widest"
                onClick={() => setIsEditPriceOpen(true)}
              >
                <Tag className="w-4 h-4 mr-2" /> Adjust Price
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden bg-white shadow-2xl border-8 border-white group">
              <Image
                src={
                  listing.imageUrls?.[0] ||
                  "https://picsum.photos/seed/placeholder/800/600"
                }
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-10 space-y-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Market Description
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {listing.description}
              </p>
              <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Condition
                  </p>
                  <p className="text-lg font-black text-[#225BC3]">
                    {listing.condition}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Listed On
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {new Date(listing.postedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
              <div className="bg-[#225BC3] p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Zap className="w-20 h-20" />
                </div>
                <Badge className="bg-[#34CBED] text-white border-none px-4 py-1 uppercase text-[9px] font-black mb-4">
                  Market Active
                </Badge>
                <h1 className="text-3xl font-black mb-2 leading-tight tracking-tight uppercase">
                  {listing.title}
                </h1>
                <p className="text-white/60 font-bold flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" /> {listing.location}
                </p>
              </div>

              <CardContent className="p-10 space-y-8">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    {listing.isAuction ? "Current High Bid" : "Listed Price"}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-[#225BC3]">
                      R{" "}
                      {(
                        listing.highestBid ||
                        listing.price ||
                        0
                      ).toLocaleString()}
                    </span>
                    {listing.isAuction && !isAuctionEnded && (
                      <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[10px] uppercase">
                        Live
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {listing.isAuction ? (
                    isAuctionEnded ? (
                      <div className="p-8 bg-slate-50 rounded-3xl text-center">
                        <p className="text-xl font-black text-slate-400 uppercase tracking-widest">
                          Auction Concluded
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-sm font-black text-[#FF8C00] uppercase tracking-widest bg-orange-50 p-4 rounded-2xl">
                          <Clock className="w-5 h-5" /> {timeLeft}
                        </div>
                        <div className="flex gap-4">
                          <Input
                            type="number"
                            placeholder="Enter bid"
                            className="h-16 rounded-2xl font-black text-xl bg-slate-50 border-none shadow-inner"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                          />
                          <Button
                            className="h-16 px-10 bg-[#225BC3] text-white font-black rounded-2xl text-lg shadow-xl"
                            onClick={() => {
                              setIsBidding(true);
                              setTimeout(() => {
                                setIsBidding(false);
                                toast({ title: "Bid Successful" });
                              }, 1000);
                            }}
                            disabled={isBidding}
                          >
                            {isBidding ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              "Bid"
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <Button
                        className="w-full bg-[#FF8C00] text-white font-black h-18 rounded-[1.8rem] shadow-xl text-xl hover:scale-105 transition-all"
                        onClick={() => setIsPaymentOpen(true)}
                      >
                        Purchase Securely
                      </Button>
                      {!isSeller && (
                        <Button
                          variant="outline"
                          className="w-full h-16 rounded-[1.8rem] font-black border-slate-100 text-slate-500 gap-3"
                          onClick={() => setIsOfferOpen(true)}
                        >
                          <HandCoins className="w-6 h-6" /> Propose Offer
                        </Button>
                      )}
                    </div>
                  )}
                  {!isSeller && (
                    <Button
                      variant="ghost"
                      className="w-full h-16 rounded-[1.8rem] font-black text-slate-400 hover:text-[#225BC3] transition-all"
                      onClick={handleStartChat}
                    >
                      <MessageSquare className="w-6 h-6 mr-3" /> Chat with
                      Seller
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 flex items-center justify-between ring-1 ring-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 rounded-[1.5rem] overflow-hidden shadow-2xl border-4 border-slate-50 bg-slate-100">
                  <img
                    src={`https://picsum.photos/seed/${listing.sellerId}/200/200`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-xl text-slate-900 leading-none">
                    Verified Trader
                  </h3>
                  <VerifiedBadge />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-2xl h-14 w-14 bg-slate-50"
                onClick={() => router.push(`/profile/${listing.sellerId}`)}
              >
                <ChevronRight className="w-8 h-8 text-[#225BC3]" />
              </Button>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Price Dialog */}
      <Dialog open={isEditPriceOpen} onOpenChange={setIsEditPriceOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-md border-none shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-black text-[#225BC3] uppercase tracking-tighter">
              Adjust Listing Price
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 italic">
              Setting a lower price will automatically notify all interested
              watchers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-2">
                New Market Price (R)
              </Label>
              <Input
                type="number"
                placeholder={listing.price.toString()}
                className="h-20 rounded-3xl bg-slate-50 border-none font-black text-4xl px-8 shadow-inner"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
              <Zap className="w-6 h-6 text-[#225BC3] shrink-0" />
              <p className="text-[11px] text-blue-700 font-bold leading-relaxed uppercase">
                Decreasing the price increases visibility and trade conversion
                velocity.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsEditPriceOpen(false)}
              className="rounded-2xl font-black uppercase text-[10px]"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#225BC3] rounded-3xl font-black text-white px-12 h-16 shadow-xl flex-1 text-lg"
              onClick={handleUpdatePrice}
              disabled={isUpdatingPrice || !newPrice}
            >
              {isUpdatingPrice ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Confirm Adjust"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-[#225BC3] p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Lock className="w-16 h-16" />
            </div>
            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Safe Payout Hold
            </DialogTitle>
            <DialogDescription className="text-sm text-white/70 font-medium mt-2">
              Funds are secured by platform escrow.
            </DialogDescription>
          </div>
          <div className="p-10 space-y-8">
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="gap-3"
            >
              {PAYMENT_METHODS.map((method) => (
                <Label
                  key={method.id}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer group",
                    paymentMethod === method.id
                      ? "border-[#225BC3] bg-[#225BC3]/5"
                      : "border-slate-50 bg-white hover:border-slate-100",
                  )}
                >
                  <RadioGroupItem value={method.id} className="sr-only" />
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                      paymentMethod === method.id
                        ? "bg-[#225BC3] text-white"
                        : "bg-slate-50 text-slate-400 group-hover:bg-slate-100",
                    )}
                  >
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-slate-900 uppercase tracking-tight">
                      {method.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {method.description}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
            <Button
              className="w-full h-18 bg-[#225BC3] text-white font-black rounded-3xl shadow-2xl text-lg hover:scale-[1.02] transition-all"
              onClick={() => {
                setIsPaying(true);
                setTimeout(() => {
                  setIsPaying(false);
                  setIsPaymentOpen(false);
                  toast({ title: "Payment Held" });
                }, 2000);
              }}
              disabled={isPaying}
            >
              {isPaying ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `Deposit R ${listing.price?.toLocaleString()}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
