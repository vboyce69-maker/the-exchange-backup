
"use client";

import { useState } from "react";
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
  ArrowRightLeft
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
  const [isEscrowActive, setIsEscrowActive] = useState(true); // Simulate a paid deal
  
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
    toast({ title: "Status Updated", description: "Other user has been notified." });
  };

  const handleArrived = () => {
    setMeetingRequest({ ...meetingRequest, myStatus: 'arrived', status: 'arrived' });
    toast({ title: "Arrived!", description: "Waiting for other party." });
  };

  const handleCompleted = () => {
    setShowFeedback(true);
  };

  const submitFeedback = () => {
    setMeetingRequest({ ...meetingRequest, status: 'completed' });
    setIsEscrowActive(false);
    setShowFeedback(false);
    toast({ title: "Deal Completed!", description: "Funds have been released to the seller." });
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex gap-6">
        <aside className="hidden lg:block w-80 bg-white border rounded-[2rem] shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-6 border-b bg-[#225BC3]/5"><h2 className="font-headline font-bold text-lg text-[#225BC3]">Conversations</h2></div>
          <div className="p-5 bg-blue-50/50 border-l-4 border-[#225BC3] flex gap-3 cursor-pointer">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm">Alex Rivera</span>
              <p className="text-xs text-muted-foreground truncate">Funds in escrow...</p>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col bg-white border rounded-[2.5rem] shadow-xl overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-5 border-b flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-[#225BC3]/10"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
              <div>
                <h3 className="font-bold text-[#225BC3]">Alex Rivera <VerifiedBadge /></h3>
                <span className="text-[10px] font-black text-[#34CBED] uppercase tracking-wider">96% RELIABILITY</span>
              </div>
            </div>
            {isEscrowActive && (
              <Badge className="bg-green-600 text-white border-none px-4 py-1.5 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Escrow Protected (R 4,500)
              </Badge>
            )}
          </div>

          <div className="relative flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {isEscrowActive && (
              <Alert className="bg-[#225BC3]/5 border-[#225BC3]/20 rounded-2xl">
                <Lock className="h-4 w-4 text-[#225BC3]" />
                <AlertTitle className="font-black text-[#225BC3] text-xs uppercase tracking-widest">Platform Escrow Active</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground font-medium">
                  The buyer has secured funds for this deal. Confirm the meetup and complete the deal to release payment.
                </AlertDescription>
              </Alert>
            )}

            {meetingRequest.status === 'pending' && (
              <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden ring-1 ring-[#225BC3]/10">
                <div className="bg-[#225BC3] p-4 text-white flex justify-between items-center font-bold text-sm">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Meeting Request</div>
                  <Badge className="bg-[#34CBED] text-white border-none">Secure Zone</Badge>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><NavIcon className="w-5 h-5 text-[#225BC3]" /></div>
                    <div><p className="font-bold text-[#225BC3]">{meetingRequest.location}</p><p className="text-[10px] text-muted-foreground">{meetingRequest.time}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-[#225BC3] text-white font-bold rounded-2xl h-12" onClick={() => setMeetingRequest({...meetingRequest, status: 'accepted'})}>Accept</Button>
                    <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setMeetingRequest({...meetingRequest, status: 'none'})}>Decline</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {(['accepted', 'on_the_way', 'arrived'].includes(meetingRequest.status)) && (
              <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden ring-1 ring-green-100">
                <div className="bg-green-600 p-4 text-white flex justify-between items-center font-bold text-sm">
                  <div className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> LIVE MEETUP TRACKER</div>
                  {isEscrowActive && <Badge className="bg-white/20">Secured Deal</Badge>}
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-12 relative mb-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-xl", meetingRequest.myStatus === 'idle' ? "bg-white border-slate-100" : "bg-green-500 border-green-100")}><Avatar className="w-12 h-12"><AvatarImage src="https://picsum.photos/seed/user2/100/100" /></Avatar></div>
                      <span className="text-[10px] font-black uppercase text-center">{meetingRequest.myStatus === 'idle' ? "Waiting" : meetingRequest.myStatus.replace('_', ' ')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-xl bg-white border-slate-100"><Avatar className="w-12 h-12"><AvatarImage src="https://picsum.photos/seed/user1/100/100" /></Avatar></div>
                      <span className="text-[10px] font-black uppercase text-center">Seller: Waiting</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {meetingRequest.myStatus === 'idle' && <Button className="w-full h-14 bg-[#225BC3] font-bold rounded-2xl shadow-lg" onClick={handleOnTheWay}>I'm on my way</Button>}
                    {meetingRequest.myStatus === 'on_the_way' && <Button className="w-full h-14 bg-green-600 font-bold rounded-2xl shadow-lg" onClick={handleArrived}>I have arrived</Button>}
                    {meetingRequest.myStatus === 'arrived' && (
                      <div className="space-y-3">
                        <Button className="w-full h-14 bg-[#34CBED] font-black text-white rounded-2xl shadow-lg" onClick={handleCompleted}>Release Funds & Complete Deal</Button>
                        <Alert className="bg-yellow-50 border-yellow-200"><AlertTriangle className="h-4 w-4 text-yellow-600" /><AlertDescription className="text-[10px] text-yellow-700 font-bold">Never release funds before seeing the item.</AlertDescription></Alert>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {meetingRequest.status === 'completed' && (
              <div className="flex flex-col items-center justify-center py-10 bg-green-50 rounded-[3rem] border-2 border-dashed border-green-200">
                <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-black text-green-700 uppercase">Deal Successful</h3>
                <p className="text-xs text-green-600 font-bold">Funds released to seller. +15 Trust Points.</p>
              </div>
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
          </div>
        </div>
      </main>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black text-[#225BC3]">How was the trade?</DialogTitle></DialogHeader>
          <div className="space-y-4 py-6">
            {['Smooth trade', 'Item matched description', 'Friendly behaviour'].map((opt) => (
              <div key={opt} className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Checkbox id={opt} className="h-5 w-5" /><label htmlFor={opt} className="font-bold text-[#225BC3] cursor-pointer">{opt}</label>
              </div>
            ))}
          </div>
          <DialogFooter><Button className="w-full h-14 bg-[#225BC3] text-white font-black rounded-2xl" onClick={submitFeedback}>Release Escrow & Rate</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
