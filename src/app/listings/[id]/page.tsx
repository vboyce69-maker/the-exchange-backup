
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
  Star,
  Info,
  ChevronRight,
  CreditCard,
  Building2,
  SmartphoneNfc,
  Lock,
  Gavel,
  FileText,
  ArrowLeft,
  AlertTriangle,
  Layers,
  Clock,
  Loader2,
  ShieldAlert,
  History,
  Shield,
  Banknote,
  Smartphone,
  Camera,
  Flag,
  HandCoins,
  Zap
} from "lucide-react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SellerTierBadge, SellerTier } from "@/components/SellerTierBadge";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
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
import { useDoc, useFirestore, useMemoFirebase, useUser, useStorage } from "@/firebase";
import { doc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const PAYMENT_METHODS = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, American Express" },
  { id: "capitec", name: "Capitec Pay", icon: SmartphoneNfc, description: "Fastest bank checkout in SA" },
  { id: "eft", name: "Instant EFT (Ozow)", icon: Building2, description: "Directly from your bank account" },
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const storage = useStorage();
  const { user } = useUser();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState<File | null>(null);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPaying, setIsPaying] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const listingRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "publicListings", id as string);
  }, [db, id]);

  const { data: listing, isLoading } = useDoc(listingRef);

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

  const handleStartChat = async () => {
    if (!db || !listing) return;

    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to message this seller and initiate a trade.",
        variant: "destructive"
      });
      router.push(`/login?redirect=/listings/${id}`);
      return;
    }

    setIsStartingChat(true);
    
    try {
      // Check for existing thread
      const q = query(
        collection(db, "chatThreads"), 
        where("listingId", "==", id),
        where("participants", "array-contains", user.uid)
      );
      const snap = await getDocs(q);
      
      let threadId;
      if (snap.empty) {
        const newThread = await addDoc(collection(db, "chatThreads"), {
          listingId: id,
          listingTitle: listing.title,
          participants: [user.uid, listing.sellerId],
          updatedAt: serverTimestamp(),
          lastMessage: "Conversation initiated."
        });
        threadId = newThread.id;
      } else {
        threadId = snap.docs[0].id;
      }
      
      router.push(`/messages?thread=${threadId}`);
    } catch (err) {
      console.error("Chat Initiation Error:", err);
      toast({
        variant: "destructive",
        title: "Communication Fault",
        description: "We couldn't connect to the secure messaging service. Please try again."
      });
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!user || !db || !listing || !offerAmount) return;
    
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid offer price." });
      return;
    }

    setIsSendingOffer(true);
    try {
      const q = query(
        collection(db, "chatThreads"), 
        where("listingId", "==", id),
        where("participants", "array-contains", user.uid)
      );
      const snap = await getDocs(q);
      
      let threadId;
      if (snap.empty) {
        const newThread = await addDoc(collection(db, "chatThreads"), {
          listingId: id,
          listingTitle: listing.title,
          participants: [user.uid, listing.sellerId],
          updatedAt: serverTimestamp(),
          lastMessage: `New offer received: R ${amount.toLocaleString()}`
        });
        threadId = newThread.id;
      } else {
        threadId = snap.docs[0].id;
      }

      await addDoc(collection(db, "chatThreads", threadId, "messages"), {
        senderId: user.uid,
        text: `Hi, I'd like to make an offer of R ${amount.toLocaleString()} for this item.`,
        timestamp: serverTimestamp(),
        isOffer: true,
        offerAmount: amount
      });

      await updateDoc(doc(db, "chatThreads", threadId), {
        lastMessage: `Offer: R ${amount.toLocaleString()}`,
        updatedAt: serverTimestamp()
      });

      toast({ title: "Offer Sent", description: "The seller has been notified of your offer." });
      setIsOfferOpen(false);
      setOfferAmount("");
      router.push(`/messages?thread=${threadId}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send offer." });
    } finally {
      setIsSendingOffer(false);
    }
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaymentOpen(false);
      toast({
        title: "Funds Held in Protection Hold",
        description: "Payment secured. Funds will be released only after you confirm the meetup.",
      });
      handleStartChat();
    }, 2000);
  };

  const handleSubmitDispute = async () => {
    if (!user || !db || !storage || !disputeReason) return;
    setIsSubmittingDispute(true);
    try {
      let evidenceUrl = "";
      if (disputeEvidence) {
        const sRef = ref(storage, `disputes/${user.uid}/${Date.now()}`);
        await uploadBytes(sRef, disputeEvidence);
        evidenceUrl = await getDownloadURL(sRef);
      }

      await addDoc(collection(db, "disputes"), {
        reporterId: user.uid,
        listingId: id,
        reason: disputeReason,
        evidenceUrl,
        status: 'open',
        createdAt: serverTimestamp()
      });

      toast({ title: "Report Submitted", description: "Our security team has been notified." });
      setIsDisputeOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit report." });
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in to place a bid." });
      return;
    }
    const amount = parseFloat(bidAmount);
    const currentMax = listing?.highestBid || listing?.price || 0;
    
    if (isNaN(amount) || amount <= currentMax) {
      toast({ variant: "destructive", title: "Invalid Bid", description: `Your bid must be higher than R ${currentMax.toLocaleString()}.` });
      return;
    }

    setIsBidding(true);
    updateDocumentNonBlocking(doc(db, "publicListings", id as string), {
      highestBid: amount,
      highestBidderId: user.uid,
      status: "auction_active"
    });

    setTimeout(() => {
      setIsBidding(false);
      setBidAmount("");
      toast({ title: "Bid Placed!", description: `You are now the highest bidder at R ${amount.toLocaleString()}.` });
    }, 800);
  };

  const handleBoostListing = async () => {
    if (!db || !id) return;
    setIsBoosting(true);
    updateDocumentNonBlocking(doc(db, "publicListings", id as string), {
      isBoosted: true,
      boostedAt: new Date().toISOString()
    });
    
    setTimeout(() => {
      setIsBoosting(false);
      toast({
        title: "Listing Boosted!",
        description: "Your item is now prioritized at the top of search results.",
      });
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold text-slate-500 hover:text-[#225BC3] h-10 rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> <span className="text-sm">Back</span>
          </Button>
          {!isSeller && (
            <Button variant="ghost" className="text-red-400 font-black uppercase text-[10px] tracking-widest gap-2" onClick={() => setIsDisputeOpen(true)}>
              <Flag className="w-3.5 h-3.5" /> Report Listing
            </Button>
          )}
          {isSeller && (
            <Button 
              className={cn(
                "font-black uppercase text-[10px] tracking-widest gap-2 h-10 rounded-xl shadow-lg",
                listing.isBoosted ? "bg-accent text-white opacity-50 cursor-default" : "bg-primary text-white hover:scale-105 transition-all"
              )}
              onClick={handleBoostListing}
              disabled={isBoosting || listing.isBoosted}
            >
              {isBoosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
              {listing.isBoosted ? "Currently Boosted" : "Boost Listing"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Photos */}
          <div className="lg:col-span-7 space-y-6">
            <div className="px-2 lg:px-0">
               <Carousel className="w-full">
                <CarouselContent>
                  {listing.imageUrls?.map((url: string, i: number) => (
                    <CarouselItem key={i}>
                      <div className="relative aspect-[4/3] rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-white shadow-2xl border-4 lg:border-8 border-white">
                        <Image src={url} alt={listing.title} fill className="object-cover" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 lg:left-6 bg-white/80 h-9 w-9 lg:h-10 lg:w-10" />
                <CarouselNext className="right-4 lg:right-6 bg-white/80 h-9 w-9 lg:h-10 lg:w-10" />
              </Carousel>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-white p-1 rounded-2xl h-12 lg:h-14 w-full justify-start gap-2 shadow-sm border border-slate-100 mb-4 lg:mb-6">
                <TabsTrigger value="description" className="flex-1 lg:flex-none rounded-xl px-4 lg:px-8 font-black uppercase text-[9px] lg:text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
                  <FileText className="hidden xs:inline w-3 h-3 mr-2" /> Description
                </TabsTrigger>
                <TabsTrigger value="specs" className="flex-1 lg:flex-none rounded-xl px-4 lg:px-8 font-black uppercase text-[9px] lg:text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
                  <Info className="hidden xs:inline w-3 h-3 mr-2" /> Details
                </TabsTrigger>
              </TabsList>
              
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 lg:p-8">
                <TabsContent value="description" className="mt-0">
                  <h3 className="text-lg lg:text-xl font-black text-slate-900 mb-4">About this listing</h3>
                  <p className="text-slate-600 text-sm lg:text-base leading-relaxed font-medium whitespace-pre-wrap">{listing.description}</p>
                  <div className="mt-6 p-6 bg-red-50 rounded-3xl border border-red-100 flex gap-4">
                    <ShieldAlert className="w-8 h-8 lg:w-10 lg:h-10 text-red-600 shrink-0" />
                    <p className="text-[11px] text-red-600 font-bold leading-relaxed">NOTICE: Deals outside 'The Exchange' are at your own risk. Use in-app payments.</p>
                  </div>
                </TabsContent>
                <TabsContent value="specs" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Condition</span>
                      <span className="font-black text-[#225BC3] text-sm">{listing.condition}</span>
                    </div>
                  </div>
                </TabsContent>
              </Card>
            </Tabs>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] lg:rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
              <div className="bg-[#225BC3] p-6 text-white">
                <div className="flex justify-between items-start mb-2">
                   <Badge className="bg-[#34CBED] text-white border-none px-3 uppercase text-[8px] font-black w-fit">Protected Hold</Badge>
                   {listing.isAuction && (
                     <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">Auction Status</p>
                        <p className="text-lg font-black">{isAuctionEnded ? "Ended" : "Live"}</p>
                     </div>
                   )}
                </div>
                <h1 className="text-xl lg:text-2xl font-black mb-1 tracking-tight">{listing.title}</h1>
                <p className="text-white/60 text-sm font-bold flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.location || 'Local'}</p>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {listing.isAuction ? 'Highest Bid' : 'Price'}
                    </span>
                    <span className="text-2xl lg:text-3xl font-black text-[#225BC3]">R {(listing.highestBid || listing.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <VerifiedBadge />
                    {listing.isBoosted && (
                      <Badge className="bg-accent text-white border-none font-black text-[8px] uppercase px-3 py-1 rounded-xl">
                        <Zap className="w-2.5 h-2.5 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {listing.isAuction ? (
                    isAuctionEnded ? (
                      <div className="p-6 bg-slate-50 rounded-2xl text-center">
                         <Gavel className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                         <p className="text-lg font-black text-slate-400 uppercase">Auction Ended</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-black text-[#FF8C00] uppercase tracking-widest">
                          <Clock className="w-4 h-4" /> {timeLeft}
                        </div>
                        <div className="flex gap-3">
                          <Input type="number" placeholder="Bid amount" className="h-14 rounded-xl font-bold bg-slate-50" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                          <Button className="h-14 px-8 bg-[#225BC3] text-white font-black rounded-xl" onClick={handlePlaceBid} disabled={isBidding}>
                            {isBidding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Place Bid"}
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Button className="w-full bg-[#FF8C00] text-white font-black h-16 rounded-2xl shadow-xl text-lg" onClick={() => setIsPaymentOpen(true)}>
                        Secure Purchase
                      </Button>
                      {!isSeller && (
                        <Button variant="outline" className="w-full h-14 rounded-2xl font-black border-[#225BC3]/20 text-[#225BC3] gap-2" onClick={() => setIsOfferOpen(true)}>
                          <HandCoins className="w-5 h-5" /> Make an Offer
                        </Button>
                      )}
                    </div>
                  )}
                  {!isSeller && (
                    <Button 
                      variant="ghost" 
                      className="w-full h-14 rounded-2xl font-black text-slate-400 hover:text-[#225BC3] transition-all" 
                      onClick={handleStartChat}
                      disabled={isStartingChat}
                    >
                       {isStartingChat ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <MessageSquare className="w-5 h-5 mr-2" />} 
                       Chat with Seller
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-50">
                        <img src={`https://picsum.photos/seed/user${listing.sellerId}/200/200`} alt="seller" width={64} height={64} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h3 className="font-black text-lg text-slate-900 leading-none">Verified Seller</h3>
                        <VerifiedBadge />
                     </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 bg-slate-50" onClick={() => router.push(`/profile/${listing.sellerId}`)}>
                     <ChevronRight className="w-6 h-6" />
                  </Button>
               </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Payment Sheet */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-none p-0 overflow-hidden shadow-2xl mx-4">
          <div className="bg-[#225BC3] p-6 text-white">
            <DialogTitle className="text-xl font-black text-white">Secure Payout Hold</DialogTitle>
            <DialogDescription className="text-xs text-white/70">Funds are held until trade completion.</DialogDescription>
          </div>
          <div className="p-6 space-y-6">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-2.5">
               {PAYMENT_METHODS.map((method) => (
                  <Label key={method.id} className={cn("flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer", paymentMethod === method.id ? "border-[#225BC3] bg-[#225BC3]/5" : "border-slate-100 bg-white")}>
                     <RadioGroupItem value={method.id} className="sr-only" />
                     <method.icon className={cn("w-4 h-4", paymentMethod === method.id ? "text-[#225BC3]" : "text-slate-400")} />
                     <span className="font-black text-xs">{method.name}</span>
                  </Label>
               ))}
            </RadioGroup>
            <Button className="w-full h-14 bg-[#225BC3] text-white font-black rounded-2xl shadow-2xl" onClick={handlePayment} disabled={isPaying}>
               {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : `Commit R ${listing.price?.toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offer Dialog */}
      <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#225BC3] uppercase tracking-tighter">Submit Price Offer</DialogTitle>
            <DialogDescription className="text-sm font-medium">Propose a fair price for this item. Sellers are more likely to accept offers close to the listed price.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Your Proposed Price (R)</Label>
              <Input 
                type="number" 
                placeholder={listing.price.toString()} 
                className="h-16 rounded-2xl bg-slate-50 border-none font-black text-3xl px-6" 
                value={offerAmount} 
                onChange={(e) => setOfferAmount(e.target.value)} 
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl flex gap-3">
              <Info className="w-5 h-5 text-[#225BC3] shrink-0" />
              <p className="text-[10px] text-blue-700 font-bold leading-relaxed">Making an offer initiates a trade discussion. If the seller accepts, you can proceed to Secure Payment.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOfferOpen(false)} className="rounded-xl font-black">Cancel</Button>
            <Button className="bg-[#225BC3] rounded-2xl font-black text-white px-10 h-14 shadow-xl" onClick={handleMakeOffer} disabled={isSendingOffer || !offerAmount}>
              {isSendingOffer ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
        <DialogContent className="rounded-[2rem] p-8 max-w-md">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black text-red-600 uppercase tracking-tighter">Security Incident Report</DialogTitle>
              <DialogDescription className="text-sm font-medium">Describe the issue and attach evidence for platform review.</DialogDescription>
           </DialogHeader>
           <div className="space-y-6 py-4">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-400">Reason for Report</Label>
                 <Textarea placeholder="Explain what happened..." className="rounded-xl bg-slate-50 border-none min-h-[100px]" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-400">Evidence Photo</Label>
                 <Input type="file" className="rounded-xl bg-slate-50 border-none h-12 py-3" onChange={(e) => setDisputeEvidence(e.target.files?.[0] || null)} />
              </div>
           </div>
           <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDisputeOpen(false)} className="rounded-xl font-black">Cancel</Button>
              <Button className="bg-red-600 rounded-xl font-black text-white px-8 h-12" onClick={handleSubmitDispute} disabled={isSubmittingDispute || !disputeReason}>
                 {isSubmittingDispute ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit To Security"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
