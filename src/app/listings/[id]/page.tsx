"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  Gavel,
  ArrowLeft,
  Clock,
  Loader2,
  Zap,
  Bell,
  BellOff,
  Tag,
  HandCoins,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useDoc,
  useFirestore,
  useFunctions,
  useMemoFirebase,
  useUser,
  useCollection,
} from "@/firebase";
import { httpsCallable } from "firebase/functions";
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


export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const functionsInstance = useFunctions();
  const { user } = useUser();

  const [isInitiatingPurchase, setIsInitiatingPurchase] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isEditPriceOpen, setIsEditPriceOpen] = useState(false);

  const [bidAmount, setBidAmount] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const pendingTransactionRef = useMemoFirebase(() => {
    if (!db || !pendingTransactionId) return null;
    return doc(db, "transactions", pendingTransactionId);
  }, [db, pendingTransactionId]);

  const { data: pendingTransaction } = useDoc(pendingTransactionRef);

  useEffect(() => {
    if (!pendingTransaction || !pendingTransactionId) return;

    // This is the real confirmation, not the Paystack popup's onSuccess.
    // paystackWebhook is the only thing that ever sets status to "held",
    // and it only does so after verifying the charge with Paystack
    // server-side. Until this fires, the buyer sees "Verifying payment...".
    if (pendingTransaction.status === "held") {
      toast({
        title: "Payment Confirmed",
        description: "Your payment is held securely in escrow. Arrange the meetup with the seller to complete the sale.",
      });
      setPendingTransactionId(null);
    } else if (pendingTransaction.status === "cancelled") {
      toast({
        variant: "destructive",
        title: "Payment Could Not Be Confirmed",
        description: "Something went wrong confirming your payment. If you were charged, please contact support.",
      });
      setPendingTransactionId(null);
    }
  }, [pendingTransaction, pendingTransactionId]);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsFollowing(!!followDocs && followDocs.length > 0);
  }, [followDocs]);

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

const handlePlaceBid = async () => {
  const newBid = parseFloat(bidAmount);
  if (!db || !id || !user || !listing) return;
  if (isNaN(newBid) || newBid <= (listing.highestBid || listing.price || 0)) {
    toast({
      variant: "destructive",
      title: "Invalid Bid",
      description: "Your bid must be higher than the current bid.",
    });
    return;
  }

  setIsBidding(true);
  try {
    const previousBidderId = listing.highestBidderId;
    const listingDocRef = doc(db, "publicListings", id as string);

    await updateDoc(listingDocRef, {
      highestBid: newBid,
      highestBidderId: user.uid,
    });

    if (previousBidderId && previousBidderId !== user.uid) {
      await addDoc(collection(db, "notifications"), {
        userId: previousBidderId,
        listingId: id,
        type: "outbid",
        title: "You've Been Outbid! 🔔",
        message: `Someone placed a higher bid of R ${newBid.toLocaleString()} on "${listing.title}".`,
        timestamp: serverTimestamp(),
        isRead: false,
      });
    }

    toast({ title: "Bid Successful", description: `You're now the highest bidder at R ${newBid.toLocaleString()}.` });
    setBidAmount("");
  } catch (err) {
    console.error(err);
    toast({
      variant: "destructive",
      title: "Bid Failed",
      description: "Could not place your bid. Please try again.",
    });
  } finally {
    setIsBidding(false);
  }
};

const handleInitiatePurchase = async () => {
  if (!user) {
    toast({
      variant: "destructive",
      title: "Sign In Required",
      description: "Please sign in to make a purchase.",
    });
    return;
  }

  if (!functionsInstance || !listing) return;

  // Guards against a second press while a purchase is already mid-flight,
  // whether we're still talking to createTransaction or already waiting
  // on the Paystack popup / webhook confirmation.
  if (isInitiatingPurchase || pendingTransactionId) return;

  setIsInitiatingPurchase(true);

  try {
    const createTransaction = httpsCallable(functionsInstance, "createTransaction");
    const result = await createTransaction({ listingId: id });
    const data = result.data as {
      success: boolean;
      transactionId: string;
      accessCode: string;
      reference: string;
    };

    // Paystack's Inline JS is a browser-only popup library, so it's
    // dynamically imported here rather than at the top of the file —
    // importing it at module scope would break server-side rendering.
    const PaystackPop = (await import("@paystack/inline-js")).default;
    const popup = new PaystackPop();

    popup.resumeTransaction(data.accessCode, {
      onSuccess: () => {
        // IMPORTANT: this does NOT mean the payment is confirmed. It only
        // means the buyer finished interacting with Paystack's popup and
        // Paystack's client-side SDK believes the charge went through.
        // That belief can be wrong or spoofed, so we never act on it
        // directly — it's purely the cue to switch into a "Verifying..."
        // state and start watching the transaction doc in Firestore.
        // The real confirmation only comes from paystackWebhook, which
        // verifies the charge server-side before setting status to "held".
        setIsInitiatingPurchase(false);
        setPendingTransactionId(data.transactionId);

        // Safety net: if paystackWebhook never fires (Paystack outage,
        // misconfigured webhook URL, etc.), don't leave the buyer staring
        // at "Verifying payment..." forever.
        setTimeout(() => {
          setPendingTransactionId((current) =>
            current === data.transactionId ? null : current
          );
        }, 60000);
      },
      onCancel: () => {
        // The buyer closed the popup without paying. No transaction was
        // confirmed, the listing was never locked (see createTransaction's
        // comments), so there's nothing to undo — just let them retry.
        setIsInitiatingPurchase(false);
      },
      onError: (error: any) => {
        setIsInitiatingPurchase(false);
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: error?.message ?? "Something went wrong with the payment popup. Please try again.",
        });
      },
    });
  } catch (err: any) {
    console.error(err);
    toast({
      variant: "destructive",
      title: "Could Not Start Purchase",
      description:
        err?.message ?? "Something went wrong starting your purchase. Please try again.",
    });
    setIsInitiatingPurchase(false);
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
              lastMessage: "🤝 Handshake established.",
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

  if (isLoading || !mounted)
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
                            onClick={handlePlaceBid}
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
                        className="w-full bg-[#FF8C00] text-white font-black h-18 rounded-[1.8rem] shadow-xl text-xl hover:scale-105 transition-all disabled:opacity-80 disabled:hover:scale-100"
                        onClick={handleInitiatePurchase}
                        disabled={isInitiatingPurchase || !!pendingTransactionId}
                      >
                        {pendingTransactionId ? (
                          <span className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Verifying Payment...
                          </span>
                        ) : isInitiatingPurchase ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          "Purchase Securely"
                        )}
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
    </div>
  );
}