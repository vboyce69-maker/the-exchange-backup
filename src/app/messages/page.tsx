
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
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", senderId: "seller", text: "Hey! Are you still interested in the Mountain Bike?", timestamp: "10:30 AM" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scamAlert, setScamAlert] = useState<AntiScamChatProtectionOutput | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isEscrowActive, setIsEscrowActive] = useState(true);
  
  const [meetingRequest, setMeetingRequest] = useState({
    status: 'pending',
    location: "Shell Garage Main Road",
    time: "Tomorrow 13:00",
    requester: "Alex Rivera",
    myStatus: 'idle',
  });

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
              <p className="text-xs text-muted-foreground truncate">Funds in protected hold...</p>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col bg-white border rounded-[2.5rem] shadow-xl overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-5 border-b flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-[#225BC3]/10"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
              <h3 className="font-bold text-[#225BC3]">Alex Rivera <VerifiedBadge /></h3>
            </div>
            {isEscrowActive && (
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
                    <Button className="flex-1 bg-[#225BC3] text-white font-bold rounded-2xl h-12" onClick={() => setMeetingRequest({...meetingRequest, status: 'accepted'})}>Accept</Button>
                    <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setMeetingRequest({...meetingRequest, status: 'none'})}>Decline</Button>
                  </div>
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
    </div>
  );
}
