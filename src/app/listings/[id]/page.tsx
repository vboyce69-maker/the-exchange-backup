
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Share2, 
  Flag, 
  Clock,
  Star,
  Info,
  Gavel,
  Calendar,
  HandCoins,
  ChevronRight,
  Shield,
  ShoppingCart,
  Phone,
  Navigation as NavIcon
} from "lucide-react";
import Image from "next/image";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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

const TIME_SLOTS = [
  { id: "t1", day: "Today", label: "15:00" },
  { id: "t2", day: "Today", label: "17:30" },
  { id: "t3", day: "Tomorrow", label: "10:00" },
  { id: "t4", day: "Tomorrow", label: "13:00" },
  { id: "t5", day: "Tomorrow", label: "18:00" },
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

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
    isAuction: id === "a1" || id === "a2" || id === "a3" || false,
    postedDate: "2 days ago",
    category: "Sports",
  };

  const handleSendBookingRequest = () => {
    toast({
      title: "Request Sent!",
      description: `Meeting request sent to ${listing.seller.name}. Successful deals: +10 pts.`,
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
                      <Image 
                        src={url} 
                        alt={listing.title} 
                        fill 
                        className="object-cover"
                      />
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

            {/* Price & Action Card */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white ring-1 ring-[#225BC3]/5">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-5xl font-black text-[#225BC3]">R {listing.price.toLocaleString()}</span>
                  <div className="text-right">
                    <VerifiedBadge />
                    <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Price is Negotiable</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button className="w-full bg-[#225BC3] text-white font-bold h-14 rounded-2xl shadow-lg" onClick={() => router.push('/messages')}>
                    <MessageSquare className="w-5 h-5 mr-2" /> Chat with Seller
                  </Button>
                  <Button variant="outline" className="w-full border-[#225BC3] text-[#225BC3] font-bold h-14 rounded-2xl hover:bg-[#225BC3]/5">
                    <HandCoins className="w-5 h-5 mr-2" /> Make Offer
                  </Button>
                  
                  {/* KILLER FEATURE: COMMITMENT BOOKING */}
                  <Dialog open={isBookingOpen} onOpenChange={(open) => {
                    setIsBookingOpen(open);
                    if (!open) setBookingStep(1);
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:col-span-2 bg-[#34CBED] text-white font-bold h-14 rounded-2xl shadow-lg hover:shadow-[#34CBED]/20 transition-all">
                        <Calendar className="w-5 h-5 mr-2" /> Book a Safe Meetup
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none p-8 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-[#225BC3] flex items-center gap-2">
                          <ShieldCheck className="w-8 h-8 text-[#34CBED]" />
                          {bookingStep === 1 ? "Choose Location" : "Select Date & Time"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="py-6">
                        {bookingStep === 1 ? (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground mb-4">Select an approved public meeting place. Manual addresses are disabled for safety.</p>
                            <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation} className="gap-3">
                              {SAFE_ZONES.map((zone) => (
                                <div key={zone.id} className="relative">
                                  <RadioGroupItem value={zone.name} id={zone.id} className="sr-only" />
                                  <Label 
                                    htmlFor={zone.id} 
                                    className={cn(
                                      "flex flex-col gap-1 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                      selectedLocation === zone.name ? "border-[#34CBED] bg-blue-50/50" : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-[#225BC3]">{zone.name}</span>
                                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-[#34CBED] text-[#34CBED]">{zone.distance}</Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{zone.type} • {zone.address}</p>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            <div className="pt-4 space-y-3">
                              <Button variant="outline" className="w-full rounded-2xl h-12 border-slate-200 font-bold">
                                <NavIcon className="w-4 h-4 mr-2" /> View Map
                              </Button>
                              <Button 
                                className="w-full rounded-2xl bg-[#225BC3] h-14 font-black shadow-lg" 
                                disabled={!selectedLocation}
                                onClick={() => setBookingStep(2)}
                              >
                                Continue <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              {['Today', 'Tomorrow'].map((day) => (
                                <div key={day} className="space-y-3">
                                  <h4 className="text-[10px] font-black uppercase text-muted-foreground px-2">{day}</h4>
                                  <RadioGroup value={selectedTime} onValueChange={setSelectedTime} className="gap-2">
                                    {TIME_SLOTS.filter(s => s.day === day).map((slot) => (
                                      <div key={slot.id} className="relative">
                                        <RadioGroupItem value={`${slot.day} ${slot.label}`} id={slot.id} className="sr-only" />
                                        <Label 
                                          htmlFor={slot.id} 
                                          className={cn(
                                            "flex items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer font-bold text-sm",
                                            selectedTime === `${slot.day} ${slot.label}` ? "border-[#34CBED] bg-blue-50/50 text-[#225BC3]" : "border-slate-100 bg-white hover:border-slate-200"
                                          )}
                                        >
                                          {slot.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </div>
                              ))}
                            </div>
                            <Button 
                              className="w-full rounded-2xl bg-[#225BC3] h-14 font-black shadow-xl" 
                              disabled={!selectedTime}
                              onClick={handleSendBookingRequest}
                            >
                              Send Request
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button className="w-full sm:col-span-2 bg-green-600 text-white font-bold h-14 rounded-2xl shadow-lg mt-2">
                    <ShoppingCart className="w-5 h-5 mr-2" /> Buy Now (Secure Escrow)
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-2xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#34CBED]" />
                  <span className="text-[10px] font-bold text-[#225BC3] uppercase tracking-wider">Buyer Protection: Funds held until delivery</span>
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
                        {listing.seller.isVerified && <VerifiedBadge />}
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

            <Card className="rounded-[2rem] border-none shadow-md bg-white p-6 ring-1 ring-slate-50">
              <CardContent className="p-0 space-y-4">
                <h3 className="font-black flex items-center gap-2 text-[#225BC3] uppercase text-xs tracking-widest">
                  <Info className="w-4 h-4 text-[#34CBED]" />
                  Product Description
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
