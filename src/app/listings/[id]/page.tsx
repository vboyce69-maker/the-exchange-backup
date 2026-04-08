
"use client";

import { useState } from "react";
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
  Clock,
  Star,
  Info,
  Calendar,
  HandCoins,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Building2,
  SmartphoneNfc,
  Lock,
  Gavel,
  History,
  FileText,
  Truck,
  ArrowLeft
} from "lucide-react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const SAFE_ZONES = [
  { id: "sz1", name: "Central Police Station", type: "Security", distance: "1.2 km", address: "123 Law Ave" },
  { id: "sz2", name: "Mall Entrance A", type: "Shopping", distance: "2.0 km", address: "456 Retail Way" },
  { id: "sz3", name: "Shell Garage Main Road", type: "Petrol Station", distance: "0.8 km", address: "789 Petrol St" },
];

const BID_HISTORY = [
  { user: "Sarah K.", amount: 4800, time: "2 mins ago" },
  { user: "John D.", amount: 4700, time: "1 hour ago" },
  { user: "Mike T.", amount: 4500, time: "5 hours ago" },
];

const PAYMENT_METHODS = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, American Express" },
  { id: "capitec", name: "Capitec Pay", icon: SmartphoneNfc, description: "Fastest bank checkout in SA" },
  { id: "eft", name: "Instant EFT (Ozow)", icon: Building2, description: "Directly from your bank account" },
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPaying, setIsPaying] = useState(false);

  const listing = {
    id,
    title: "Mountain Bike XT-400 Professional",
    price: 4500,
    description: "In excellent condition. Recently serviced with brand new tires. Perfect for trail riding and weekend adventures. Includes specialized helmet and bike lock.",
    specs: [
      { key: "Frame", value: "Aluminum Alloy" },
      { key: "Gears", value: "Shimano 21-Speed" },
      { key: "Brakes", value: "Hydraulic Disc" },
      { key: "Weight", value: "14kg" },
    ],
    location: "Downtown, Metro City",
    distance: "5.2 km",
    imageUrls: [
      "https://picsum.photos/seed/bike/800/600",
      "https://picsum.photos/seed/bike-2/800/600",
      "https://picsum.photos/seed/bike-3/800/600"
    ],
    seller: {
      id: "u123",
      name: "Alex Rivera",
      rating: 4.9,
      reliability: 96,
      memberSince: "Jan 2023",
      isVerified: true,
      phoneVerified: true,
    },
    category: "Sports",
    isAuction: true,
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaymentOpen(false);
      toast({
        title: "Funds Held in Escrow",
        description: "Payment secured. Funds will be released only after you confirm the meetup.",
      });
      router.push('/messages');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 font-bold text-slate-500 hover:text-[#225BC3]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Photos - eBay/Takealot Style Carousel */}
          <div className="lg:col-span-7 space-y-6">
            <Carousel className="w-full">
              <CarouselContent>
                {listing.imageUrls.map((url, i) => (
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

            {/* Structured Tabs - Takealot style */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-white p-1 rounded-2xl h-14 w-full justify-start gap-2 shadow-sm border border-slate-100 mb-6">
                <TabsTrigger value="description" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
                  <FileText className="w-3 h-3 mr-2" /> Description
                </TabsTrigger>
                <TabsTrigger value="specs" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
                  <Info className="w-3 h-3 mr-2" /> Specs
                </TabsTrigger>
                {listing.isAuction && (
                   <TabsTrigger value="bids" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">
                    <History className="w-3 h-3 mr-2" /> Bid History
                  </TabsTrigger>
                )}
              </TabsList>
              
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
                <TabsContent value="description" className="mt-0">
                  <h3 className="text-xl font-black text-slate-900 mb-4">About this item</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {listing.description}
                  </p>
                </TabsContent>
                
                <TabsContent value="specs" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listing.specs.map((s, i) => (
                      <div key={i} className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{s.key}</span>
                        <span className="font-black text-[#225BC3] text-sm">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="bids" className="mt-0">
                  <div className="space-y-4">
                    {BID_HISTORY.map((bid, i) => (
                      <div key={i} className={cn(
                        "flex items-center justify-between p-4 rounded-2xl",
                        i === 0 ? "bg-[#225BC3]/5 border-2 border-[#225BC3]" : "bg-slate-50"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black", i === 0 ? "bg-[#225BC3] text-white" : "bg-slate-200 text-slate-500")}>
                            {bid.user[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{bid.user}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{bid.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#225BC3]">R {bid.amount.toLocaleString()}</p>
                          {i === 0 && <Badge className="bg-[#34CBED] text-white text-[8px] border-none uppercase">Highest Bid</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Card>
            </Tabs>
          </div>

          {/* Checkout/Action Sidebar - eBay style */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
              <div className="bg-[#225BC3] p-8 text-white">
                <div className="flex justify-between items-start mb-4">
                   <Badge className="bg-[#34CBED] text-white border-none px-3">PROTECTED DEAL</Badge>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Closing In</p>
                      <p className="text-xl font-black">2h 45m 12s</p>
                   </div>
                </div>
                <h1 className="text-3xl font-black mb-2">{listing.title}</h1>
                <p className="text-white/60 text-sm font-bold flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {listing.location} ({listing.distance})
                </p>
              </div>
              
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Bid</span>
                    <span className="text-5xl font-black text-[#225BC3]">R {listing.price.toLocaleString()}</span>
                  </div>
                  <VerifiedBadge />
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black h-16 rounded-2xl shadow-xl text-lg" onClick={() => setIsPaymentOpen(true)}>
                      <Gavel className="w-5 h-5 mr-2" /> Place Bid
                    </Button>
                    <Button variant="outline" className="flex-1 border-2 border-[#225BC3] text-[#225BC3] font-black h-16 rounded-2xl hover:bg-[#225BC3]/5 text-lg">
                       Buy Now
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="ghost" className="h-14 rounded-2xl bg-slate-50 font-bold text-slate-600" onClick={() => router.push('/messages')}>
                      <MessageSquare className="w-5 h-5 mr-2" /> Chat
                    </Button>
                    <Button variant="ghost" className="h-14 rounded-2xl bg-slate-50 font-bold text-slate-600">
                      <HandCoins className="w-5 h-5 mr-2" /> Offer
                    </Button>
                  </div>

                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-14 border-2 border-[#34CBED] text-[#34CBED] bg-white font-black rounded-2xl mt-4">
                        <Calendar className="w-5 h-5 mr-2" /> Book Safe Meetup
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] border-none p-8">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-[#225BC3]">Select Meeting Point</DialogTitle>
                        <DialogDescription className="font-bold">Choose a vetted safe location in your area.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                        {SAFE_ZONES.map(z => (
                          <div key={z.id} className="p-5 border-2 border-slate-100 rounded-3xl hover:border-[#34CBED] transition-all cursor-pointer group">
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-black text-slate-900 group-hover:text-[#225BC3] transition-colors">{z.name}</span>
                                <Badge className="bg-slate-100 text-slate-500 border-none">{z.distance}</Badge>
                             </div>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">{z.address}</p>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex gap-4">
                  <ShieldCheck className="w-10 h-10 text-green-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-green-800 uppercase tracking-widest mb-1">Money Back Guarantee</p>
                    <p className="text-[11px] text-green-700 leading-relaxed font-bold">
                      Your funds are held safely until you confirm delivery. Simple, secure, local.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Dashboard - Takealot style */}
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-lg">
                      <Image src="https://picsum.photos/seed/user1/200/200" alt="seller" fill />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <h3 className="font-black text-xl text-slate-900">{listing.seller.name}</h3>
                         <VerifiedBadge />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="flex text-yellow-500"><Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /></div>
                         <span className="text-[10px] font-black text-muted-foreground">({listing.seller.reliability}% RELIABILITY)</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-slate-50" onClick={() => router.push(`/profile/${listing.seller.id}`)}>
                    <ChevronRight className="w-6 h-6" />
                  </Button>
               </div>
               
               <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Response</p>
                     <p className="text-xs font-black text-[#225BC3]">&lt; 1 HR</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                     <p className="text-xs font-black text-[#225BC3]">2023</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sold</p>
                     <p className="text-xs font-black text-[#225BC3]">128+</p>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Payment Sheet - South Africa Specific */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem] border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-[#225BC3] p-10 text-white">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Lock className="w-8 h-8 text-[#34CBED]" />
              Secure Checkout
            </h2>
            <p className="text-white/60 font-bold mt-2 uppercase text-xs tracking-widest">South African Platform Escrow</p>
          </div>
          <div className="p-10 space-y-8">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total to hold</p>
                  <p className="text-3xl font-black text-[#225BC3]">R {listing.price.toLocaleString()}</p>
               </div>
               <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>

            <div className="space-y-4">
              <Label className="font-black text-xs uppercase tracking-widest text-slate-400 ml-2">Choose Payment Method</Label>
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
              {isPaying ? "Processing..." : `Pay R ${listing.price.toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
