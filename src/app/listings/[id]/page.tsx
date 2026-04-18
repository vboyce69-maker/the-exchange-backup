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
  ShieldAlert
} from "lucide-react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
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
    
    // Transition status to pending meetup
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 font-bold text-slate-500 hover:text-[#225BC3]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Photos */}
          <div className="lg:col-span-7 space-y-6">
            <Carousel className="w-full">
              <CarouselContent>
                {listing.imageUrls?.map((url: string, i: number) => (
                  <CarouselItem key={i}>
                    <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden bg-white shadow-2xl border-8 border-white">
                      <Image src={url} alt={listing.title} fill className="object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-6 bg-white/80" />
              <CarouselNext className="right-6 bg-white/80" />
            </Carousel>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-white p-1 rounded-2xl h-14 w-full justify-start gap-2 shadow-sm border border-slate-100 mb-6">
                <TabsTrigger value="description" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
                  <FileText className="w-3 h-3 mr-2" /> Description
                </TabsTrigger>
                <TabsTrigger value="specs" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
                  <Info className="w-3 h-3 mr-2" /> Details
                </TabsTrigger>
              </TabsList>
              
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <TabsContent value="description" className="mt-0">
                  <h3 className="text-xl font-black text-slate-900 mb-4">About this listing</h3>
                  <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {listing.description}
                  </p>
                  
                  {listing.isBulk && (
                    <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                      <Layers className="w-10 h-10 text-[#225BC3] shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest mb-1">Bulk Lot Information</p>
                        <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                          This is a bulk lot containing {listing.quantity} items. Please verify the total count and condition of all items before completing the transaction.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 p-6 bg-red-50 rounded-3xl border border-red-100 flex gap-4">
                    <ShieldAlert className="w-10 h-10 text-red-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Off-Platform Liability Waiver</p>
                      <p className="text-[11px] text-red-600 font-bold leading-relaxed">
                        NOTICE: Any deals or meetings made outside of 'The Exchange' app are strictly at your own risk. The company is NOT liable for any damages, loss, or safety issues that arise from off-platform activity. Always use in-app chat and payments.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
                    <Scale className="w-10 h-10 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">No Platform Warranty</p>
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                        To the fullest extent permitted by law, the platform does not give warranties or guarantees about the quality, safety, legality, or fitness of items listed by users.
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
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
              <div className="bg-[#225BC3] p-8 text-white">
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
                        <p className="text-xl font-black">{isAuctionEnded ? "Auction Ended" : "Live Bidding"}</p>
                     </div>
                   )}
                </div>
                <h1 className="text-3xl font-black mb-2">{listing.title}</h1>
                <p className="text-white/60 text-sm font-bold flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {listing.location || 'Local'}
                </p>
              </div>
              
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {listing.isAuction ? (listing.highestBid ? 'Highest Bid' : 'Starting Bid') : 'Price'}
                    </span>
                    <span className="text-5xl font-black text-[#225BC3]">R {(listing.highestBid || listing.price || 0).toLocaleString()}</span>
                  </div>
                  <VerifiedBadge />
                </div>

                {/* Bidding/Buying Logic */}
                <div className="space-y-4">
                  {listing.isAuction ? (
                    isAuctionEnded ? (
                      isSeller ? (
                        <div className="space-y-4">
                          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-700 mb-2">Auction completed successfully!</p>
                            <p className="text-[10px] text-blue-600 font-medium">Accept the highest bid to start the safe meetup process. Funds will be held in platform escrow once the buyer pays.</p>
                          </div>
                          <Button 
                            className="w-full h-16 bg-[#FF8C00] text-white font-black rounded-2xl text-lg shadow-xl"
                            onClick={handleAcceptHighestBid}
                            disabled={isAccepting || !listing.highestBid}
                          >
                            {isAccepting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Accept Highest Bid & Start Meetup"}
                          </Button>
                        </div>
                      ) : user?.uid === listing.highestBidderId ? (
                        <div className="p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
                           <ShieldCheck className="w-10 h-10 text-green-600 mx-auto mb-2" />
                           <p className="text-lg font-black text-green-800">You Won!</p>
                           <p className="text-xs text-green-700 font-medium">Waiting for the seller to accept your bid and initiate the trade.</p>
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                           <Gavel className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                           <p className="text-lg font-black text-slate-400">Auction Ended</p>
                        </div>
                      )
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-black text-[#FF8C00] uppercase tracking-widest">
                          <Clock className="w-4 h-4" /> {timeLeft}
                        </div>
                        <div className="flex gap-3">
                          <Input 
                            type="number" 
                            placeholder="Enter bid amount" 
                            className="h-14 rounded-xl font-bold bg-slate-50 border-none"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                          />
                          <Button 
                            className="h-14 px-8 bg-[#225BC3] text-white font-black rounded-xl"
                            onClick={handlePlaceBid}
                            disabled={isBidding}
                          >
                            {isBidding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Place Bid"}
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <Button className="w-full bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black h-16 rounded-2xl shadow-xl text-lg" onClick={() => setIsPaymentOpen(true)}>
                      Buy with Protection Hold
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="ghost" className="h-14 rounded-2xl bg-slate-50 font-bold text-slate-600" onClick={() => router.push('/messages')}>
                      <MessageSquare className="w-5 h-5 mr-2" /> Chat
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-14 rounded-2xl bg-slate-50 font-bold text-slate-600"
                      onClick={() => router.push('/messages')}
                    >
                      <Calendar className="w-5 h-5 mr-2" /> Book Meet
                    </Button>
                  </div>
                </div>

                <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100 space-y-3">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                      <h4 className="font-black text-green-800 uppercase text-[10px] tracking-widest">Safe Trade Guarantee</h4>
                   </div>
                   <p className="text-[10px] text-green-700 leading-relaxed font-bold">
                     Whether buying fixed-price or winning an auction, your funds are protected. We hold the money until you verify the item at a Safe Zone.
                   </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-lg">
                      <Image src={`https://picsum.photos/seed/user${listing.sellerId}/200/200`} alt="seller" fill />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <h3 className="font-black text-xl text-slate-900">Verified Seller</h3>
                         <VerifiedBadge />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="flex text-yellow-500"><Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /></div>
                         <span className="text-[10px] font-black text-muted-foreground">(98% RELIABILITY)</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-slate-50" onClick={() => router.push(`/profile/${listing.sellerId}`)}>
                    <ChevronRight className="w-6 h-6" />
                  </Button>
               </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Payment Sheet */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem] border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-[#225BC3] p-10 text-white">
            <h2 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter">
              <Lock className="w-8 h-8 text-[#34CBED]" />
              Secure Pay
            </h2>
          </div>
          <div className="p-10 space-y-8">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Protection Hold Amount</p>
                  <p className="text-3xl font-black text-[#225BC3]">R {listing.price?.toLocaleString()}</p>
               </div>
               <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>

            <div className="space-y-4">
              <Label className="font-black text-xs uppercase tracking-widest text-slate-400 ml-2">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.id} className="relative">
                      <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                      <Label 
                        htmlFor={method.id} 
                        className={cn(
                          "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer",
                          paymentMethod === method.id ? "border-[#225BC3] bg-[#225BC3]/5 shadow-lg" : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", paymentMethod === method.id ? "bg-[#225BC3] text-white" : "bg-slate-100 text-slate-400")}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-900 text-sm">{method.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">{method.description}</p>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <Button 
              className="w-full h-18 bg-[#225BC3] text-white font-black rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform text-lg" 
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying ? "Authorizing..." : `Pay R ${listing.price?.toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Loader2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
