
"use client";

import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { antiScamChatProtection, AntiScamChatProtectionOutput } from "@/ai/flows/anti-scam-chat-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Loader2
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
import { doc } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

// Simulated coordinates for Safe Zones
const SAFE_ZONE_COORDS: Record<string, { lat: number, lng: number }> = {
  "Shell Garage Main Road": { lat: -26.2041, lng: 28.0473 },
  "Central Police Station": { lat: -26.2100, lng: 28.0400 },
  "Mall Entrance A": { lat: -26.1950, lng: 28.0550 },
};

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Fetch user profile for home location
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
  
  const [meetingRequest, setMeetingRequest] = useState({
    status: 'pending', // 'pending', 'accepted', 'way', 'arrived', 'completed'
    location: "Shell Garage Main Road",
    time: "Tomorrow 13:00",
    requester: "Alex Rivera",
    myStatus: 'idle',
  });

  // Safe Arrival States
  const [safeArrival, setSafeArrival] = useState({
    active: false,
    estimatedMinutes: 0,
    elapsedSeconds: 0,
    isHome: false,
  });

  // Calculate distance and time
  const travelStats = useMemo(() => {
    if (!profile || !meetingRequest.location) return { distance: 0, time: 0 };
    
    const homeLat = profile.locationLatitude || -26.2041;
    const homeLng = profile.locationLongitude || 28.0473;
    const meetCoords = SAFE_ZONE_COORDS[meetingRequest.location] || SAFE_ZONE_COORDS["Shell Garage Main Road"];

    // Haversine formula
    const R = 6371; // km
    const dLat = (meetCoords.lat - homeLat) * Math.PI / 180;
    const dLon = (meetCoords.lng - homeLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(homeLat * Math.PI / 180) * Math.cos(meetCoords.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Estimate time: 40km/h average
    const timeInMinutes = Math.max(1, Math.round((distance / 40) * 60));
    
    return { distance: distance.toFixed(1), time: timeInMinutes };
  }, [profile, meetingRequest.location]);

  // Safe Arrival Timer Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (safeArrival.active && !safeArrival.isHome) {
      timer = setInterval(() => {
        setSafeArrival(prev => {
          const nextElapsed = prev.elapsedSeconds + 1;
          const totalSeconds = prev.estimatedMinutes * 60;
          return {
            ...prev,
            elapsedSeconds: nextElapsed,
            isHome: nextElapsed >= totalSeconds
          };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [safeArrival.active, safeArrival.isHome]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);

    const scanResult = await antiScamChatProtection({ message: inputValue });
    if (scanResult.isSuspicious && scanResult.riskLevel === 'high') {
      setScamAlert(scanResult);
      setIsSending(false);
      return; 
    }

    setMessages([...messages, { id: Date.now().toString(), senderId: "buyer", text: inputValue, timestamp: "Now" }]);
    setInputValue("");
    setIsSending(false);
  };

  const updateStatus = (nextStatus: string) => {
    setMeetingRequest({...meetingRequest, status: nextStatus});
    
    if (nextStatus === 'completed') {
      setSafeArrival({
        active: true,
        estimatedMinutes: travelStats.time,
        elapsedSeconds: 0,
        isHome: false
      });
      setIsEscrowActive(false);
    }

    toast({ title: "Status Updated", description: `You are now marked as ${nextStatus.replace('-', ' ')}.` });
  };

  const confirmSafeHome = () => {
    setSafeArrival(prev => ({ ...prev, active: false, isHome: true }));
    toast({
      title: "Check-in Confirmed",
      description: "You've checked in as safe. Reliability score boosted!",
    });
    setShowFeedback(true);
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-80 bg-white border rounded-[2rem] shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-6 border-b bg-[#225BC3]/5"><h2 className="font-headline font-bold text-lg text-[#225BC3]">Conversations</h2></div>
          <div className="p-5 bg-blue-50/50 border-l-4 border-[#225BC3] flex gap-3 cursor-pointer">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm">Alex Rivera</span>
              <p className="text-xs text-muted-foreground truncate">
                {meetingRequest.status === 'completed' ? "Deal Complete" : "Funds in protected hold..."}
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
            {isEscrowActive && meetingRequest.status !== 'completed' && (
              <Badge className="bg-green-600 text-white border-none px-4 py-1.5 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Protected Hold Active
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            <Alert className="bg-orange-50 border-orange-200 rounded-2xl mb-4">
               <AlertTriangle className="h-4 w-4 text-orange-600" />
               <AlertDescription className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">
                 SCAM ALERT: Automated safety tools help identify risky behavior but may not detect every scam. Be cautious and meet only in Safe Zones.
               </AlertDescription>
            </Alert>

            {/* Meetup Lifecycle Card */}
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
                  <p className="text-[9px] text-muted-foreground font-bold italic">"The platform cannot guarantee user safety during meetups. Users are responsible for their own travel and decisions."</p>
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

            {/* Arrived Safe at Home Tracker */}
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
                    <Progress 
                      value={(safeArrival.elapsedSeconds / (safeArrival.estimatedMinutes * 60)) * 100} 
                      className="h-2 bg-white/20" 
                    />
                  </div>

                  <p className="text-xs font-medium text-white/70 leading-relaxed italic">
                    "We're monitoring your expected arrival. Please confirm once you're safely indoors."
                  </p>

                  <Button 
                    className={cn(
                      "w-full h-14 rounded-2xl font-black transition-all",
                      safeArrival.isHome 
                        ? "bg-[#34CBED] text-white hover:scale-[1.02] shadow-xl" 
                        : "bg-white/10 text-white/40 cursor-wait"
                    )}
                    onClick={confirmSafeHome}
                    disabled={!safeArrival.isHome}
                  >
                    {safeArrival.isHome ? (
                      <span className="flex items-center gap-2">
                        <Home className="w-5 h-5" /> I'm Safe at Home
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Journey in Progress...
                      </span>
                    )}
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
            <p className="text-[9px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest opacity-60">No links allowed in chat for your safety</p>
          </div>
        </div>
      </main>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="rounded-[3rem] border-none p-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#225BC3]">How was the trade?</DialogTitle>
            <DialogDescription className="font-bold">Your feedback affects the seller's reliability score.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-[#225BC3] cursor-pointer">
              <Checkbox id="smooth" />
              <label htmlFor="smooth" className="text-sm font-bold cursor-pointer">Smooth trade</label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-[#225BC3] cursor-pointer">
              <Checkbox id="match" />
              <label htmlFor="match" className="text-sm font-bold cursor-pointer">Item matched description</label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-[#225BC3] cursor-pointer">
              <Checkbox id="friendly" />
              <label htmlFor="friendly" className="text-sm font-bold cursor-pointer">Seller was friendly</label>
            </div>
          </div>
          <Button className="w-full h-14 bg-[#225BC3] font-black rounded-2xl" onClick={() => setShowFeedback(false)}>Submit Feedback</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
