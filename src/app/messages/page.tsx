"use client";

import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { antiScamChatProtection, AntiScamChatProtectionOutput } from "@/ai/flows/anti-scam-chat-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShieldAlert, 
  Send, 
  MapPin, 
  MoreVertical,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation as NavIcon,
  AlertTriangle,
  ThumbsUp,
  Lock,
  ArrowRightLeft,
  Home,
  Shield,
  Loader2,
  Star,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

const SAFE_ZONE_COORDS: Record<string, { lat: number, lng: number }> = {
  "Shell Garage Main Road": { lat: -26.2041, lng: 28.0473 },
  "Central Police Station": { lat: -26.2100, lng: 28.0400 },
  "Mall Entrance A": { lat: -26.1950, lng: 28.0550 },
};

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, "userProfiles", user.uid) : null;
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", senderId: "seller", text: "Hey! Are you still interested in the Mountain Bike?", timestamp: "10:30 AM" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scamAlert, setScamAlert] = useState<AntiScamChatProtectionOutput | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isEscrowActive, setIsEscrowActive] = useState(true);
  
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [meetingRequest, setMeetingRequest] = useState({
    status: 'pending',
    location: "Shell Garage Main Road",
    time: "Tomorrow 13:00",
    requester: "Alex Rivera",
    sellerId: "seller_123",
    listingId: "listing_123",
    listingTitle: "Premium Mountain Bike",
    myStatus: 'idle',
  });

  const [safeArrival, setSafeArrival] = useState({
    active: false,
    estimatedMinutes: 0,
    elapsedSeconds: 0,
    isHome: false,
  });

  const travelStats = useMemo(() => {
    if (!profile || !meetingRequest.location) return { distance: 0, time: 0 };
    const homeLat = profile.locationLatitude || -26.2041;
    const homeLng = profile.locationLongitude || 28.0473;
    const meetCoords = SAFE_ZONE_COORDS[meetingRequest.location] || SAFE_ZONE_COORDS["Shell Garage Main Road"];
    const R = 6371; 
    const dLat = (meetCoords.lat - homeLat) * Math.PI / 180;
    const dLon = (meetCoords.lng - homeLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(homeLat * Math.PI / 180) * Math.cos(meetCoords.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    const timeInMinutes = Math.max(1, Math.round((distance / 40) * 60));
    return { distance: distance.toFixed(1), time: timeInMinutes };
  }, [profile, meetingRequest.location]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (safeArrival.active && !safeArrival.isHome) {
      timer = setInterval(() => {
        setSafeArrival(prev => {
          const nextElapsed = prev.elapsedSeconds + 1;
          const totalSeconds = prev.estimatedMinutes * 60;
          return { ...prev, elapsedSeconds: nextElapsed, isHome: nextElapsed >= totalSeconds };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [safeArrival.active, safeArrival.isHome]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);

    const scanResult = await antiScamChatProtection({ message: inputValue });
    
    if (scanResult.isSuspicious && scanResult.securityAction === 'block') {
      setScamAlert(scanResult);
      setIsSending(false);
      toast({
        variant: "destructive",
        title: "Security Violation",
        description: scanResult.reason || "This message contains prohibited content.",
      });
      return; 
    }

    if (scanResult.isSuspicious && scanResult.securityAction === 'warn') {
       toast({
         title: "Security Notice",
         description: scanResult.reason,
       });
    }

    setMessages([...messages, { id: Date.now().toString(), senderId: "buyer", text: inputValue, timestamp: "Now" }]);
    setInputValue("");
    setIsSending(false);
  };

  const updateStatus = (nextStatus: string) => {
    setMeetingRequest({...meetingRequest, status: nextStatus});
    if (nextStatus === 'completed') {
      setSafeArrival({ active: true, estimatedMinutes: travelStats.time, elapsedSeconds: 0, isHome: false });
      setIsEscrowActive(false);
    }
    toast({ title: "Status Updated", description: `You are now marked as ${nextStatus}.` });
  };

  const confirmSafeHome = () => {
    setSafeArrival(prev => ({ ...prev, active: false, isHome: true }));
    setShowFeedback(true);
  };

  const submitReview = () => {
    if (rating === 0 || !reviewComment.trim()) {
      toast({ variant: "destructive", title: "Incomplete", description: "Please provide a rating and a comment." });
      return;
    }
    setIsSubmittingReview(true);
    const reviewData = { sellerId: meetingRequest.sellerId, buyerId: user?.uid || "anon", buyerName: user?.displayName || "Verified Buyer", listingId: meetingRequest.listingId, listingTitle: meetingRequest.listingTitle, rating: rating, comment: reviewComment, createdAt: new Date().toISOString() };
    const reviewsCol = collection(db, "userProfiles", meetingRequest.sellerId, "reviews");
    addDocumentNonBlocking(reviewsCol, reviewData);
    setTimeout(() => {
      setIsSubmittingReview(false);
      setShowFeedback(false);
      toast({ title: "Review Submitted", description: "Feedback saved successfully." });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-80 bg-white border rounded-[2rem] shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-6 border-b bg-[#225BC3]/5 flex items-center justify-between">
            <h2 className="font-headline font-bold text-lg text-[#225BC3]">Conversations</h2>
            <Globe className="w-4 h-4 text-[#34CBED]" />
          </div>
          <div className="p-5 bg-blue-50/50 border-l-4 border-[#225BC3] flex gap-3 cursor-pointer">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm">Alex Rivera</span>
              <p className="text-xs text-muted-foreground truncate">
                {meetingRequest.status === 'completed' ? "Deal Complete" : "Secure hold active..."}
              </p>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col bg-white border rounded-[2.5rem] shadow-xl overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-5 border-b flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-[#225BC3]/10"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
              <h3 className="font-bold text-[#225BC3]">Alex Rivera <VerifiedBadge /></h3>
            </div>
            <Badge className="bg-[#225BC3] text-white border-none px-4 py-1.5 flex items-center gap-2 rounded-full uppercase text-[9px] font-black tracking-widest">
              <Lock className="w-3 h-3 text-[#34CBED]" /> E2E Encrypted
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 relative">
            {/* AI Security Monitor Banner */}
            <div className="sticky top-0 z-20 mb-6">
               <Alert className="bg-white border-none shadow-xl rounded-2xl ring-1 ring-[#225BC3]/10 overflow-hidden p-0">
                  <div className="bg-[#225BC3] px-4 py-2 flex items-center justify-between">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                      <Globe className="w-3 h-3" /> AI Security Monitor Active
                    </span>
                    <Badge className="bg-[#34CBED] text-[#225BC3] border-none text-[8px] font-black">OWASP Level 1</Badge>
                  </div>
                  <div className="p-4 flex gap-3">
                    <ShieldAlert className="h-5 w-5 text-orange-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-900 font-bold leading-tight">
                        Fraud Prevention: Never share your OTP or pay via external links. All legitimate 'The Exchange' transactions happen within this secure hold.
                      </p>
                    </div>
                  </div>
               </Alert>
            </div>

            {meetingRequest.status === 'pending' && (
              <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden ring-1 ring-[#225BC3]/10">
                <div className="bg-[#225BC3] p-4 text-white flex justify-between items-center font-bold text-sm">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Meetup Request</div>
                  <Badge className="bg-[#34CBED] text-white border-none text-[8px] uppercase">Secure Zone</Badge>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><NavIcon className="w-5 h-5 text-[#225BC3]" /></div>
                    <div><p className="font-bold text-[#225BC3]">{meetingRequest.location}</p><p className="text-[10px] text-muted-foreground">{meetingRequest.time}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-[#225BC3] text-white font-bold rounded-2xl h-12" onClick={() => updateStatus('accepted')}>Accept</Button>
                    <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => updateStatus('declined')}>Decline</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {meetingRequest.status !== 'pending' && meetingRequest.status !== 'declined' && meetingRequest.status !== 'completed' && (
              <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden ring-1 ring-slate-100">
                <div className="p-5 flex items-center justify-between border-b">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                      <span className="font-black text-[#225BC3] text-xs uppercase tracking-widest">Live Meetup Tracker</span>
                   </div>
                   <Badge variant="outline" className="text-[8px] uppercase">{meetingRequest.status}</Badge>
                </div>
                <CardContent className="p-6 space-y-6">
                   <div className="flex justify-between items-center text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", meetingRequest.status === 'way' || meetingRequest.status === 'arrived' ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400")}>
                          <NavIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase">On the way</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-slate-100 mx-4" />
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", meetingRequest.status === 'arrived' || meetingRequest.status === 'completed' ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400")}>
                          <MapPin className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase">Arrived</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      {meetingRequest.status === 'accepted' && <Button className="w-full bg-[#225BC3] rounded-xl h-12 font-bold" onClick={() => updateStatus('way')}>I'm on my way</Button>}
                      {meetingRequest.status === 'way' && <Button className="w-full bg-[#34CBED] rounded-xl h-12 font-bold" onClick={() => updateStatus('arrived')}>I have arrived</Button>}
                      {meetingRequest.status === 'arrived' && <Button className="w-full bg-green-600 rounded-xl h-12 font-bold" onClick={() => updateStatus('completed')}>Deal Completed</Button>}
                   </div>
                </CardContent>
              </Card>
            )}

            {safeArrival.active && (
              <Card className="border-none shadow-2xl bg-[#225BC3] text-white rounded-[2rem] overflow-hidden animate-in slide-in-from-top-4">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                       <Shield className="w-6 h-6 text-[#34CBED]" />
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-[10px] tracking-widest text-[#34CBED]">Safety Check-in</h4>
                      <h3 className="text-xl font-black">Traveling Home</h3>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase opacity-80">
                       <span>{travelStats.distance}km journey</span>
                       <span>Est. {travelStats.time} mins</span>
                    </div>
                    <Progress value={(safeArrival.elapsedSeconds / (safeArrival.estimatedMinutes * 60)) * 100} className="h-2 bg-white/20" />
                  </div>
                  <Button 
                    className={cn("w-full h-14 rounded-2xl font-black transition-all", safeArrival.isHome ? "bg-[#34CBED] text-white" : "bg-white/10 text-white/40")}
                    onClick={confirmSafeHome}
                    disabled={!safeArrival.isHome}
                  >
                    {safeArrival.isHome ? "I'm Safe at Home" : "Journey in Progress..."}
                  </Button>
                </CardContent>
              </Card>
            )}

            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col max-w-[80%] space-y-1", m.senderId === "buyer" ? "ml-auto items-end" : "items-start")}>
                <div className={cn("px-5 py-3 rounded-[1.5rem] text-sm shadow-sm", m.senderId === "buyer" ? "bg-[#225BC3] text-white rounded-tr-none" : "bg-white border border-slate-100 rounded-tl-none")}>{m.text}</div>
                <span className="text-[10px] text-muted-foreground">{m.timestamp}</span>
              </div>
            ))}
          </div>

          <div className="p-6 border-t bg-white">
            <div className="flex gap-3">
              <Input placeholder="Type a message..." className="rounded-full bg-slate-50 border-none h-12 px-6" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
              <Button size="icon" className="rounded-full bg-[#225BC3] shrink-0 h-12 w-12" onClick={handleSend}><Send className="w-5 h-5" /></Button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
               <Lock className="w-2 h-2" />
               <span className="text-[8px] font-black uppercase tracking-tighter">Encrypted Connection</span>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="rounded-[3rem] border-none p-0 overflow-hidden shadow-2xl max-w-md">
          <div className="bg-[#225BC3] p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-8 h-8 text-[#34CBED]" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Rate your Trade</DialogTitle>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110"><Star className={cn("w-10 h-10", rating >= s ? "text-[#FF8C00] fill-current" : "text-slate-200")} /></button>
              ))}
            </div>
            <Textarea placeholder="Review comment..." className="min-h-[120px] rounded-2xl bg-slate-50 border-none p-4" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
            <Button className="w-full h-14 bg-[#225BC3] font-black rounded-2xl shadow-xl" onClick={submitReview} disabled={isSubmittingReview}>
              {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}