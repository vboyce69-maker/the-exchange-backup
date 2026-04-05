
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
  Phone
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
  { id: "sz1", name: "Central Police Station", distance: "1.2 km", address: "123 Law Ave" },
  { id: "sz2", name: "Mall Entrance A", distance: "2.0 km", address: "456 Retail Way" },
  { id: "sz3", name: "Shell Garage Main Road", distance: "0.8 km", address: "789 Petrol St" },
];

const TIME_SLOTS = [
  { id: "t1", label: "Today 15:00" },
  { id: "t2", label: "Today 17:30" },
  { id: "t3", label: "Tomorrow 10:00" },
  { id: "t4", label: "Tomorrow 14:00" },
];

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState("");
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Mocked data for a rich item view
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
    currentBid: 4200,
    bidCount: 12,
    timeLeft: "5h 12m"
  };

  const handleBuyNow = () => {
    toast({
      title: "Secure Checkout",
      description: "Redirecting to escrow payment gateway. Funds are protected until you confirm delivery.",
    });
  };

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= listing.currentBid) {
      toast({
        variant: "destructive",
        title: "Invalid Bid",
        description: `Your bid must be higher than R ${listing.currentBid.toLocaleString()}.`,
      });
      return;
    }
    toast({
      title: "Bid Placed!",
      description: `You are now the highest bidder at R ${amount.toLocaleString()}.`,
    });
    setBidAmount("");
  };

  const handleSendBookingRequest = () => {
    toast({
      title: "Request Sent!",
      description: `Meeting request sent to ${listing.seller.name}.`,
    });
    setIsBookingOpen(false);
    setTimeout(() => router.push('/messages'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Photos Section */}
          <div className="space-y-4">
            <Carousel className="w-full">
              <CarouselContent>
                {listing.imageUrls.map((url, i) => (
                  <CarouselItem key={i}>
                    <div className="relative aspect-square rounded-3xl overflow-hidden border bg-white shadow-md">
                      <Image 
                        src={url} 
                        alt={`${listing.title} image ${i + 1}`} 
                        fill 
                        className="object-cover"
                        data-ai-hint="product image"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline" className="bg-white">{listing.category}</Badge>
                  {listing.isAuction && (
                    <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                      Live Auction
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold font-headline text-[#225BC3]">{listing.title}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4 text-primary" /> {listing.location}
                  </p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {listing.distance} away
                  </Badge>
                  <p className="text-xs text-muted-foreground">Posted {listing.postedDate}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm">
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm text-destructive">
                  <Flag className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Action Card */}
            <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-4xl font-extrabold text-[#225BC3]">R {listing.price.toLocaleString()}</span>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200 py-1 px-3">
                    Verified Listing
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button className="w-full bg-[#225BC3] text-white font-bold h-14 rounded-2xl shadow-lg hover:shadow-xl transition-all" onClick={() => router.push('/messages')}>
                    <MessageSquare className="w-5 h-5 mr-2" /> Chat with Seller
                  </Button>
                  <Button variant="outline" className="w-full border-primary text-primary font-bold h-14 rounded-2xl hover:bg-primary/5">
                    <HandCoins className="w-5 h-5 mr-2" /> Make Offer
                  </Button>
                  
                  <Button 
                    className="w-full sm:col-span-2 bg-[#34CBED] text-white font-bold h-14 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-2"
                    onClick={handleBuyNow}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" /> Buy Now (Secure Escrow)
                  </Button>
                  
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full sm:col-span-2 text-primary font-bold h-12 rounded-xl hover:bg-primary/5">
                        <Calendar className="w-5 h-5 mr-2" /> Book Meeting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <ShieldCheck className="w-6 h-6 text-primary" />
                          {bookingStep === 1 ? "Select Safe Zone" : "Choose Time"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        {bookingStep === 1 ? (
                          <div className="space-y-4">
                            <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
                              {SAFE_ZONES.map((zone) => (
                                <div key={zone.id} className="flex items-center space-x-2 border p-4 rounded-2xl hover:bg-secondary/50 cursor-pointer transition-colors bg-white">
                                  <RadioGroupItem value={zone.name} id={zone.id} />
                                  <Label htmlFor={zone.id} className="flex-1 cursor-pointer">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold">{zone.name}</span>
                                      <Badge variant="outline" className="text-[10px]">{zone.distance}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{zone.address}</p>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            <Button 
                              className="w-full rounded-xl bg-primary h-12 font-bold" 
                              disabled={!selectedLocation}
                              onClick={() => setBookingStep(2)}
                            >
                              Continue
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                              {TIME_SLOTS.map((slot) => (
                                <div key={slot.id} className="flex items-center space-x-2 border p-4 rounded-2xl hover:bg-secondary/50 cursor-pointer transition-colors bg-white">
                                  <RadioGroupItem value={slot.label} id={slot.id} />
                                  <Label htmlFor={slot.id} className="flex-1 cursor-pointer font-bold">
                                    {slot.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            <Button 
                              className="w-full rounded-xl bg-primary h-12 font-bold" 
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
                </div>
                
                <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 bg-slate-50 py-2 rounded-lg border">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  Buyer Protection: Funds held until confirmation
                </p>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="rounded-2xl border-none shadow-sm bg-white">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-[#225BC3]">
                  <Info className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="rounded-2xl border-none shadow-md bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                      <Image src="https://picsum.photos/seed/user1/100/100" alt="seller" fill />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{listing.seller.name}</span>
                        {listing.seller.isVerified && <VerifiedBadge />}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          {listing.seller.rating}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Member since {listing.seller.memberSince}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full border-primary text-primary" onClick={() => router.push(`/profile/${listing.seller.id}`)}>
                    View Profile
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 border-t pt-6">
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Reliability</p>
                    <p className="text-xl font-black text-primary">{listing.seller.reliability}%</p>
                  </div>
                  <div className="text-center border-x">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Phone</p>
                    <div className="flex justify-center text-green-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Sales</p>
                    <p className="text-xl font-black">128</p>
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
