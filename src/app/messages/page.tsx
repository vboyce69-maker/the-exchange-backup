
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { antiScamChatProtection, AntiScamChatProtectionOutput } from "@/ai/flows/anti-scam-chat-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ShieldAlert, 
  Send, 
  MapPin, 
  AlertCircle,
  Lock,
  MoreVertical,
  Flag,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation as NavIcon,
  AlertTriangle,
  ChevronRight,
  ThumbsUp,
  MessageSquare
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

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'blocked';
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", senderId: "seller", text: "Hey! Are you still interested in the Mountain Bike?", timestamp: "10:30 AM" },
  { id: "2", senderId: "buyer", text: "Yes, I am. Is it in good condition?", timestamp: "10:32 AM" },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scamAlert, setScamAlert] = useState<AntiScamChatProtectionOutput | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Meeting Flow States
  const [meetingRequest, setMeetingRequest] = useState<{
    status: 'none' | 'pending' | 'accepted' | 'on_the_way' | 'arrived' | 'completed' | 'reported';
    location: string;
    time: string;
    requester: string;
    reliability: number;
    myStatus: 'idle' | 'on_the_way' | 'arrived';
    otherStatus: 'idle' | 'on_the_way' | 'arrived';
  }>({
    status: 'pending',
    location: "Shell Garage Main Road",
    time: "Tomorrow 13:00",
    requester: "Alex Rivera",
    reliability: 96,
    myStatus: 'idle',
    otherStatus: 'idle'
  });

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);
    setScamAlert(null);

    const scanResult = await antiScamChatProtection({ message: inputValue });
    if (scanResult.isSuspicious && scanResult.riskLevel === 'high') {
      setScamAlert(scanResult);
      setIsSending(false);
      return; 
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "buyer",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsSending(false);
  };

  const handleOnTheWay = () => {
    setMeetingRequest({ ...meetingRequest, myStatus: 'on_the_way', status: 'on_the_way' });
    toast({ title: "Status Updated", description: "Other user has been notified you are on the way." });
  };

  const handleArrived = () => {
    setMeetingRequest({ ...meetingRequest, myStatus: 'arrived', status: 'arrived' });
    toast({ title: "Arrived!", description: "Waiting for other party. Showing up: +5 pts." });
  };

  const handleCompleted = () => {
    setShowFeedback(true);
  };

  const submitFeedback = () => {
    setMeetingRequest({ ...meetingRequest, status: 'completed' });
    setShowFeedback(false);
    toast({ title: "Deal Completed!", description: "Success! Score +10 reliability points." });
  };

  const handleNoShow = () => {
    toast({
      variant: "destructive",
      title: "No-Show Reported",
      description: "Penalty of -15 reliability points applied to user. Safety first.",
    });
    setMeetingRequest({ ...meetingRequest, status: 'reported' });
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 bg-white border rounded-[2rem] shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-6 border-b bg-[#225BC3]/5">
            <h2 className="font-headline font-bold text-lg text-[#225BC3]">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-full">
            <div className="p-5 bg-blue-50/50 border-l-4 border-[#225BC3] flex gap-3 cursor-pointer">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm truncate">Alex Rivera</span>
                  <Badge className="bg-[#225BC3] text-white text-[8px] h-4">96% REL</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">Meeting request pending...</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white border rounded-[2.5rem] shadow-xl overflow-hidden h-[calc(100vh-10rem)]">
          {/* Chat Header */}
          <div className="p-5 border-b flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-[#225BC3]/10">
                <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#225BC3]">Alex Rivera</h3>
                  <VerifiedBadge />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#34CBED] uppercase tracking-wider">96% RELIABILITY</span>
                  <span className="text-[10px] text-muted-foreground">• Active Seller</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>

          <div className="relative flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {/* Seller Confirmation Notification */}
            {meetingRequest.status === 'pending' && (
              <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden ring-1 ring-[#225BC3]/10 animate-in slide-in-from-top-4">
                <div className="bg-[#225BC3] p-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Calendar className="w-4 h-4" />
                    Meeting Request
                  </div>
                  <Badge className="bg-[#34CBED] text-white border-none text-[10px]">High Trust</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <NavIcon className="w-6 h-6 text-[#225BC3]" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Samsung 55" TV</p>
                        <p className="font-bold text-[#225BC3]">Buyer: {meetingRequest.requester} (Rel {meetingRequest.reliability}%)</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Location</span>
                        <p className="text-sm font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#34CBED]" />
                          {meetingRequest.location}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Time</span>
                        <p className="text-sm font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#34CBED]" />
                          {meetingRequest.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-[#225BC3] text-white font-bold h-12 rounded-2xl shadow-lg" 
                        onClick={() => setMeetingRequest({...meetingRequest, status: 'accepted'})}
                      >
                        Accept Request
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-[#225BC3] text-[#225BC3] font-bold h-12 rounded-2xl"
                        onClick={() => setMeetingRequest({...meetingRequest, status: 'none'})}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* LIVE TRACKER STATUS SCREEN */}
            {(['accepted', 'on_the_way', 'arrived'].includes(meetingRequest.status)) && (
              <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden ring-1 ring-green-100 animate-in slide-in-from-top-4">
                <div className="bg-green-600 p-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    MEETUP STATUS
                  </div>
                  <span className="text-[10px] font-black">{meetingRequest.time}</span>
                </div>
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-black text-[#225BC3]">{meetingRequest.location}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Vetted Safe Zone</p>
                  </div>

                  <div className="grid grid-cols-2 gap-12 relative mb-8">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 z-0" />
                    
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-xl transition-all",
                        meetingRequest.myStatus === 'idle' ? "bg-white border-slate-100 text-slate-300" : "bg-green-500 border-green-100 text-white"
                      )}>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="https://picsum.photos/seed/user2/100/100" />
                        </Avatar>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-black uppercase tracking-tight block">Your Status</span>
                        <span className={cn(
                          "text-xs font-bold",
                          meetingRequest.myStatus === 'idle' ? "text-muted-foreground" : "text-green-600"
                        )}>
                          {meetingRequest.myStatus === 'idle' ? "Not on the way" : meetingRequest.myStatus === 'on_the_way' ? "On the way" : "Arrived"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-xl transition-all",
                        meetingRequest.otherStatus === 'idle' ? "bg-white border-slate-100 text-slate-300" : "bg-[#34CBED] border-blue-50 text-white"
                      )}>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
                        </Avatar>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-black uppercase tracking-tight block">Seller Status</span>
                        <span className={cn(
                          "text-xs font-bold",
                          meetingRequest.otherStatus === 'idle' ? "text-muted-foreground" : "text-[#34CBED]"
                        )}>
                          {meetingRequest.otherStatus === 'idle' ? "Not on the way" : "On the way"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {meetingRequest.myStatus === 'idle' && (
                      <Button className="w-full h-14 bg-[#225BC3] text-white font-bold rounded-2xl shadow-lg" onClick={handleOnTheWay}>
                        I'm on my way
                      </Button>
                    )}
                    {meetingRequest.myStatus === 'on_the_way' && (
                      <Button className="w-full h-14 bg-green-600 text-white font-bold rounded-2xl shadow-lg" onClick={handleArrived}>
                        I have arrived
                      </Button>
                    )}
                    {meetingRequest.myStatus === 'arrived' && (
                      <div className="space-y-3">
                        <Button className="w-full h-14 bg-[#34CBED] text-white font-bold rounded-2xl shadow-lg" onClick={handleCompleted}>
                          Deal completed
                        </Button>
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-xs text-yellow-700">
                            Waiting for the other party. If they don't show: 
                            <button className="ml-1 font-bold underline" onClick={handleNoShow}>Report No-Show (-15 pts)</button>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {meetingRequest.status === 'reported' && (
              <Alert variant="destructive" className="rounded-3xl border-destructive/50">
                <XCircle className="h-5 w-5" />
                <AlertTitle className="font-bold">No-Show Reported</AlertTitle>
                <AlertDescription>
                  This behavior has been flagged. The user's reliability score has been penalized. Safety first.
                </AlertDescription>
              </Alert>
            )}

            {meetingRequest.status === 'completed' && (
              <div className="flex flex-col items-center justify-center py-8 bg-green-50 rounded-[3rem] border-2 border-dashed border-green-200 animate-in zoom-in-95">
                <div className="bg-green-600 p-4 rounded-full mb-4 shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-green-700 uppercase">Trade Successful!</h3>
                <p className="text-xs text-green-600 font-bold">+15 Reliability Points Earned</p>
              </div>
            )}

            {/* Standard Messages */}
            {messages.map((m) => (
              <div key={m.id} className={cn(
                "flex flex-col max-w-[80%] space-y-1",
                m.senderId === "buyer" ? "ml-auto items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-5 py-3 rounded-[1.5rem] text-sm shadow-sm",
                  m.senderId === "buyer" 
                    ? "bg-[#225BC3] text-white rounded-tr-none" 
                    : "bg-white text-foreground rounded-tl-none border border-slate-100"
                )}>
                  {m.text}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{m.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t bg-white">
            <div className="flex gap-3">
              <Input 
                placeholder="Type your message..." 
                className="rounded-full bg-slate-50 border-none h-12 px-6 focus:ring-2 focus:ring-[#225BC3]/20 transition-all"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" className="rounded-full bg-[#225BC3] shrink-0 h-12 w-12 shadow-lg hover:bg-[#225BC3]/90" onClick={handleSend}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Auto-Rating Post Deal */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#225BC3]">How did it go?</DialogTitle>
            <DialogDescription className="font-bold">
              Help us maintain a safe community by rating the behavior.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            {[
              { id: "smooth", label: "Smooth trade", icon: CheckCircle2 },
              { id: "desc", label: "Item matched description", icon: MapPin },
              { id: "friendly", label: "Friendly behavior", icon: ThumbsUp }
            ].map((opt) => (
              <div key={opt.id} className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#34CBED] transition-all cursor-pointer group">
                <Checkbox id={opt.id} className="h-5 w-5 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-[#34CBED] data-[state=checked]:border-[#34CBED]" />
                <label htmlFor={opt.id} className="flex-1 flex items-center gap-2 font-bold text-[#225BC3] cursor-pointer">
                  <opt.icon className="w-4 h-4 text-[#34CBED]" />
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button className="w-full h-14 bg-[#225BC3] text-white font-black rounded-2xl shadow-xl" onClick={submitFeedback}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
