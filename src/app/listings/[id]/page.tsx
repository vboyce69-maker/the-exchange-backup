
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Lock
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
  { id: "sz4", name: "Starbucks Waterfront", type: "Coffee Shop", distance: "1.5 km", address: "101 Brew Blvd" },
];

const PAYMENT_METHODS = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, American Express" },
  { id: "capitec", name: "Capitec Pay", icon: SmartphoneNfc, description: "Fastest bank checkout in SA" },
  { id: "eft", name: "Instant EFT (Ozow)", icon: Building2, description: "Directly from your bank account" },
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPaying, setIsPaying] = useState(false);

  const listing = {
    id,
    title: "Mountain Bike XT-400",
    price: 4500,
    description: "In excellent condition. Recently serviced with brand new tires. Perfect for trail riding and weekend adventures. Includes specialized helmet and bike lock.",
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
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setIsPaymentOpen(false);
      toast({
        title: "Funds Held in Escrow",
        description: "Payment secured via Paystack. Funds will be released only after you confirm the meetup.",
      });
      router.push('/messages');
    }, 2000);
  };

  const handleSendBookingRequest = () => {
    toast({
      title: "Request Sent!",
      description: `Meeting request sent to ${listing.seller.name}.`,
    });
    setIsBookingOpen(false);
    setTimeout(() => router.push('/messages'), 1000);
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Photos */}
          <div className="space-y-4">
            <Carousel className="w-full">
              <CarouselContent>
                {listing.imageUrls.map((url, i) => (
                  <CarouselItem key={i}>
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white bg-white shadow-xl">
                      <Image src={url} alt={listing.title} fill className="object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Badge className="bg-[#34CBED] text-white font-bold border-none uppercase text-[10px] tracking-widest px-3 py-1">
                  {listing.category}
                </Badge>
                <h1 className="text-4xl font-black font-headline text-[#225BC3] leading-none">{listing.title}</h1>
                <div className="flex items-center gap-4">
                  <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-[#34CBED]" /> {listing.location}
                  </p>
                  <Badge variant="secondary" className="bg-[#225BC3]/5 text-[#225BC3] border-none font-bold">
                    {listing.distance} away
                  </Badge>
                </div>
              </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white ring-1 ring-[#225BC3]/5">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-5xl font-black text-[#225BC3]">R {listing.price.toLocaleString()}</span>
                  <VerifiedBadge />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button className="w-full bg-[#225BC3] text-white font-bold h-14 rounded-2xl shadow-lg" onClick={() => router.push('/messages')}>
                    <MessageSquare className="w-5 h-5 mr-2" /> Chat
                  </Button>
                  <Button variant="outline" className="w-full border-[#225BC3] text-[#225BC3] font-bold h-14 rounded-2xl hover:bg-[#225BC3]/5">
                    <HandCoins className="w-5 h-5 mr-2" /> Offer
                  </Button>
                  
                  <Dialog open={isBookingOpen} onOpenChange={(open) => { setIsBookingOpen(open); if (!open) setBookingStep(1); }}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:col-span-2 border-[#34CBED] text-[#34CBED] variant-outline border-2 bg-white font-bold h-14 rounded-2xl">
                        <Calendar className="w-5 h-5 mr-2" /> Book a Safe Meetup
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none p-8">
                       <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-[#225BC3]">Choose Location</DialogTitle>
                        <DialogDescription className="font-bold">Select a public safe zone.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {SAFE_ZONES.map(z => (
                          <div key={z.id} className="p-4 border-2 border-slate-100 rounded-2xl hover:border-[#34CBED] cursor-pointer" onClick={() => { setSelectedLocation(z.name); setBookingStep(2); }}>
                            <div className="flex justify-between font-black text-[#225BC3] text-sm"><span>{z.name}</span><span className="text-[#34CBED]">{z.distance}</span></div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">{z.address}</p>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* BUY WITH PROTECTION FLOW */}
                  <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:col-span-2 bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black h-16 rounded-2xl shadow-xl mt-2 text-lg">
                        <ShoppingCart className="w-6 h-6 mr-2" /> Buy with Protection
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl">
                      <div className="bg-[#225BC3] p-8 text-white">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                          <Lock className="w-6 h-6 text-[#34CBED]" />
                          Secure Checkout
                        </h2>
                        <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">Powered by Paystack & Peach Payments</p>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <div>
                            <span className="text-[10px] font-black text-[#225BC3] uppercase block">Amount to Hold</span>
                            <span className="text-2xl font-black text-[#225BC3]">R {listing.price.toLocaleString()}</span>
                          </div>
                          <ShieldCheck className="w-10 h-10 text-green-500" />
                        </div>

                        <div className="space-y-3">
                          <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-2">Choose Payment Method</Label>
                          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-3">
                            {PAYMENT_METHODS.map((method) => {
                              const Icon = method.icon;
                              return (
                                <div key={method.id} className="relative">
                                  <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                  <Label 
                                    htmlFor={method.id} 
                                    className={cn(
                                      "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                      paymentMethod === method.id ? "border-[#225BC3] bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                  >
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", paymentMethod === method.id ? "bg-[#225BC3] text-white" : "bg-slate-100 text-slate-400")}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-black text-[#225BC3] text-sm">{method.name}</p>
                                      <p className="text-[10px] font-bold text-muted-foreground">{method.description}</p>
                                    </div>
                                  </Label>
                                </div>
                              );
                            })}
                          </RadioGroup>
                        </div>

                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex gap-3">
                          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                          <p className="text-[10px] text-green-800 leading-relaxed font-bold">
                            Funds are held securely in a platform vault. The seller only receives payment once you confirm the deal during your meetup.
                          </p>
                        </div>

                        <Button 
                          className="w-full h-16 bg-[#225BC3] text-white font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-transform" 
                          onClick={handlePayment}
                          disabled={isPaying}
                        >
                          {isPaying ? "Processing..." : `Pay R ${listing.price.toLocaleString()}`}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-2xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#34CBED]" />
                  <span className="text-[10px] font-bold text-[#225BC3] uppercase tracking-wider">Buyer Protection Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 ring-1 ring-[#225BC3]/5">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-3xl overflow-hidden border-2 border-white shadow-md">
                      <Image src="https://picsum.photos/seed/user1/100/100" alt="seller" fill />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-[#225BC3]">{listing.seller.name}</span>
                        <VerifiedBadge />
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-black">
                          <Star className="w-3 h-3 fill-current" />
                          {listing.seller.rating}
                        </div>
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tight">Reliability: {listing.seller.reliability}%</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl border-[#225BC3] text-[#225BC3] font-bold" onClick={() => router.push(`/profile/${listing.seller.id}`)}>
                    Profile
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] text-muted-foreground uppercase font-black mb-1">Response</p>
                    <p className="text-xs font-black text-[#225BC3]">&lt; 1 HR</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] text-muted-foreground uppercase font-black mb-1">Phone</p>
                    <ShieldCheck className="w-4 h-4 text-green-500 mx-auto" />
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] text-muted-foreground uppercase font-black mb-1">Sales</p>
                    <p className="text-xs font-black text-[#225BC3]">128</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
