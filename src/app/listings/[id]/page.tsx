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
  Calendar,
  ChevronRight,
  CreditCard,
  Building2,
  SmartphoneNfc,
  Lock,
  Gavel,
  FileText,
  ArrowLeft,
  AlertTriangle,
  Scale,
  Layers,
  Box,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
  ShieldAlert,
  History,
  AlertCircle,
  Shield
} from "lucide-react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SellerTierBadge, SellerTier } from "@/components/SellerTierBadge";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const PAYMENT_METHODS = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, American Express" },
  { id: "capitec", name: "Capitec Pay", icon: SmartphoneNfc, description: "Fastest bank checkout in SA" },
  { id: "eft", name: "Instant EFT (Ozow)", icon: Building2, description: "Directly from your bank account" },
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPaying, setIsPaying] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const listingRef = useMemoFirebase(() => {
    return id ? doc(db, "publicListings", id as string) : null;
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

  // Determine Seller Tier
  const getSellerTier = (transactions: number, score: number): SellerTier => {
    if (transactions >= 50 && score >= 95) return 'pro';
    if (transactions >= 10 && score >= 90) return 'trusted';
    return 'beginner';
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
      router.push('/messages');
    }, 2000);
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
    const listingDoc = doc(db, "publicListings", id as string);
    updateDocumentNonBlocking(listingDoc, {
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

  const handleAcceptHighestBid = async () => {
    if (!listingRef || !listing) return;
    setIsAccepting(true);
    
    updateDocumentNonBlocking(listingRef, {
      status: "pending_meetup"
    });

    setTimeout(() => {
      setIsAccepting(false);
      toast({
        title: "Bid Accepted",
        description: "The buyer has been notified. Starting the secure meetup process.",
      });
      router.push('/messages');
    }, 1500);
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

  const sellerTransactions = 56; // Mock data for demo
  const sellerReliability = 94; // Mock data for demo
  const sellerTier = getSellerTier(sellerTransactions, sellerReliability);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 lg:py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 lg:mb-6 font-bold text-slate-500 hover:text-[#225BC3] h-10 rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> <span className="text-sm">Back to Search</span>
        </Button>

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
                  <p className="text-slate-600 text-sm lg:text-base leading-relaxed font-medium whitespace-pre-wrap">
                    {listing.description}
                  </p>
                  
                  {listing.isBulk && (
                    <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                      <Layers className="w-8 h-8 lg:w-10 lg:h-10 text-[#225BC3] shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest mb-1">Bulk Lot Information</p>
                        <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                          This is a bulk lot containing {listing.quantity} items. Please verify the total count and condition of all items before completing the transaction.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-6 bg-red-50 rounded-3xl border border-red-100 flex gap-4">
                    <ShieldAlert className="w-8 h-8 lg:w-10 lg:h-10 text-red-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Off-Platform Liability Waiver</p>
                      <p className="text-[11px] text-red-600 font-bold leading-relaxed">
                        NOTICE: Any deals made outside of 'The Exchange' are at your own risk. Always use in-app chat and payments.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="specs" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Condition</span>
                      <span className="font-black text-[#225BC3] text-sm">{listing.condition}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Type</span>
                      <span className="font-black text-[#225BC3] text-sm">{listing.isBulk ? 'Bulk Lot' : 'Single Item'}</span>
                    </div>
                  </div>
                </TabsContent>
              </Card>
            </Tabs>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] lg:rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
              <div className="bg-[#225BC3] p-6 lg:p-8 text-white">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex flex-col gap-2">
                     <Badge className="bg-[#34CBED] text-white border-none px-3 uppercase text-[8px] font-black w-fit">Protected Hold</Badge>
                     {listing.isBulk && (
                       <Badge className="bg-[#FF8C00] text-white border-none px-3 uppercase text-[8px] font-black w-fit flex items-center gap-1">
                         <Layers className="w-2.5 h-2.5" /> Bulk Lot ({listing.quantity})
                       </Badge>
                     )}
                   </div>
                   {listing.isAuction && (
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Status</p>
                        <p className="text-lg lg:text-xl font-black whitespace-nowrap">{isAuctionEnded ? "Ended" : "Live Bidding"}</p>
                     </div>
                   )}
                </div>
                <h1 className="text-2xl lg:text-3xl font-black mb-2 leading-tight">{listing.title}</h1>
                <p className="text-white/60 text-xs lg:text-sm font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {listing.location || 'Local'}
                </p>
              </div>
              
              <CardContent className="p-6 lg:p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {listing.isAuction ? (listing.highestBid ? 'Highest Bid' : 'Starting Bid') : 'Price'}
                    </span>
                    <span className="text-3xl lg:text-5xl font-black text-[#225BC3]">R {(listing.highestBid || listing.price || 0).toLocaleString()}</span>
                  </div>
                  <VerifiedBadge />
                </div>

                {/* Bidding/Buying Logic */}
                <div className="space-y-4">
                  {listing.isAuction ? (
                    isAuctionEnded ? (
                      isSeller ? (
                        <div className="space-y-4">
                          <Button 
                            className="w-full h-14 lg:h-16 bg-[#FF8C00] text-white font-black rounded-2xl text-base lg:text-lg shadow-xl"
                            onClick={handleAcceptHighestBid}
                            disabled={isAccepting || !listing.highestBid}
                          >
                            {isAccepting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Accept Highest Bid"}
                          </Button>
                        </div>
                      ) : user?.uid === listing.highestBidderId ? (
                        <div className="p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
                           <ShieldCheck className="w-10 h-10 text-green-600 mx-auto mb-2" />
                           <p className="text-lg font-black text-green-800">You Won!</p>
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                           <Gavel className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                           <p className="text-lg font-black text-slate-400">Auction Ended</p>
                        </div>
                      )
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[10px] lg:text-sm font-black text-[#FF8C00] uppercase tracking-widest">
                          <Clock className="w-4 h-4" /> {timeLeft}
                        </div>
                        <div className="flex gap-3">
                          <Input 
                            type="number" 
                            placeholder="Enter bid" 
                            className="h-12 lg:h-14 rounded-xl font-bold bg-slate-50 border-none"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                          />
                          <Button 
                            className="h-12 lg:h-14 px-6 lg:px-8 bg-[#225BC3] text-white font-black rounded-xl text-xs lg:text-base"
                            onClick={handlePlaceBid}
                            disabled={isBidding}
                          >
                            {isBidding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bid"}
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <Button className="w-full bg-[#FF8C00] text-white font-black h-14 lg:h-16 rounded-2xl shadow-xl text-base lg:text-lg" onClick={() => setIsPaymentOpen(true)}>
                      Buy with Protection Hold
                    </Button>
                  )}
                </div>

                <div className="p-5 lg:p-6 bg-green-50 rounded-[2rem] border border-green-100 space-y-3">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 shrink-0" />
                      <h4 className="font-black text-green-800 uppercase text-[10px] tracking-widest">Safe Trade Guarantee</h4>
                   </div>
                   <p className="text-[9px] lg:text-[10px] text-green-700 leading-relaxed font-bold">
                     Funds are held in platform escrow until you verify the item at a Safe Zone.
                   </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Transaction History Sidebar Card */}
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
               <div className="p-6 lg:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-50">
                           <Image src={`https://picsum.photos/seed/user${listing.sellerId}/200/200`} alt="seller" fill />
                        </div>
                        <div>
                           <div className="flex items-center gap-1.5">
                              <h3 className="font-black text-base lg:text-lg text-slate-900 leading-none">Verified Seller</h3>
                              <VerifiedBadge />
                           </div>
                           <div className="mt-2">
                             <SellerTierBadge level={sellerTier} />
                           </div>
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 lg:h-12 lg:w-12 bg-slate-50" onClick={() => router.push(`/profile/${listing.sellerId}`)}>
                        <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                     </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <History className="w-2.5 h-2.5" /> Trades
                        </p>
                        <p className="text-lg lg:text-xl font-black text-[#225BC3]">{sellerTransactions}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <Shield className="w-2.5 h-2.5" /> Disputes
                        </p>
                        <p className="text-lg lg:text-xl font-black text-green-600">0</p>
                     </div>
                  </div>

                  <div className="pt-2">
                     <Button 
                        variant="outline" 
                        className="w-full h-11 lg:h-12 rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest border-[#225BC3]/20 text-[#225BC3] hover:bg-[#225BC3]/5"
                        onClick={() => router.push(`/profile/${listing.sellerId}`)}
                     >
                        View Full Trust Record
                     </Button>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Payment Sheet */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] lg:rounded-[3rem] border-none p-0 overflow-hidden shadow-2xl mx-4">
          <div className="bg-[#225BC3] p-8 lg:p-10 text-white">
            <DialogTitle className="text-2xl lg:text-3xl font-black flex items-center gap-3 uppercase tracking-tighter text-white">
              <Lock className="w-6 h-6 lg:w-8 lg:h-8 text-[#34CBED]" />
              Secure Pay
            </DialogTitle>
            <DialogDescription className="sr-only">
              Complete your payment for this item securely via our protected hold system.
            </DialogDescription>
          </div>
          <div className="p-8 lg:p-10 space-y-8">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Hold Amount</p>
                  <p className="text-2xl lg:text-3xl font-black text-[#225BC3]">R {listing.price?.toLocaleString()}</p>
               </div>
               <ShieldCheck className="w-10 h-10 lg:w-12 lg:h-12 text-green-500" />
            </div>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-3">
               {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className="relative">
                     <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                     <Label 
                        htmlFor={method.id} 
                        className={cn(
                           "flex items-center gap-4 p-4 lg:p-5 rounded-3xl border-2 transition-all cursor-pointer",
                           paymentMethod === method.id ? "border-[#225BC3] bg-[#225BC3]/5" : "border-slate-100 bg-white"
                        )}
                     >
                        <method.icon className={cn("w-5 h-5 lg:w-6 lg:h-6", paymentMethod === method.id ? "text-[#225BC3]" : "text-slate-400")} />
                        <div>
                           <p className="font-black text-slate-900 text-xs lg:text-sm">{method.name}</p>
                           <p className="text-[9px] lg:text-[10px] font-bold text-muted-foreground">{method.description}</p>
                        </div>
                     </Label>
                  </div>
               ))}
            </RadioGroup>

            <Button className="w-full h-16 lg:h-18 bg-[#225BC3] text-white font-black rounded-2xl lg:rounded-3xl shadow-2xl text-base lg:text-lg" onClick={handlePayment} disabled={isPaying}>
               {isPaying ? "Processing..." : `Pay R ${listing.price?.toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
