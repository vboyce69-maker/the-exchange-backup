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
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  Lock,
  Shield,
  Loader2,
  Star,
  Globe,
  Ban
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  riskScore?: number;
}

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", senderId: "seller", text: "Hey! Are you still interested in the Mountain Bike?", timestamp: "10:30 AM" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [scamWarning, setScamWarning] = useState<AntiScamChatProtectionOutput | null>(null);
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
  });

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);

    try {
      // 1. Contextual Risk Analysis
      const scanResult = await antiScamChatProtection({ message: inputValue });
      
      // 2. Logging high-risk attempts to Security Events
      if (scanResult.riskScore >= 60) {
        addDocumentNonBlocking(collection(db, "securityLogs"), {
          userId: user?.uid || "anonymous",
          type: "SUSPICIOUS_MESSAGE",
          message: inputValue,
          riskScore: scanResult.riskScore,
          decision: scanResult.decision,
          timestamp: new Date().toISOString()
        });
      }

      // 3. Enforce Blocking Logic
      if (scanResult.decision === 'block') {
        toast({
          variant: "destructive",
          title: "Message Blocked",
          description: scanResult.reason,
        });
        setIsSending(false);
        return; 
      }

      // 4. Handle Warnings
      if (scanResult.decision === 'warn' || scanResult.decision === 'hold') {
        setScamWarning(scanResult);
      } else {
        setScamWarning(null);
      }

      // 5. Success Path
      setMessages([...messages, { 
        id: Date.now().toString(), 
        senderId: "buyer", 
        text: inputValue, 
        timestamp: "Now",
        riskScore: scanResult.riskScore
      }]);
      setInputValue("");
    } catch (err) {
      toast({ variant: "destructive", title: "System Error", description: "Security filter failed to respond." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-80 bg-white border rounded-[2rem] shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-[#225BC3]/5 flex items-center justify-between">
            <h2 className="font-black text-lg text-[#225BC3] uppercase tracking-tighter">Inbox</h2>
            <Globe className="w-4 h-4 text-[#34CBED]" />
          </div>
          <div className="p-5 bg-blue-50/50 border-l-4 border-[#225BC3] flex gap-3 cursor-pointer">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm">Alex Rivera</span>
              <p className="text-[10px] text-muted-foreground truncate uppercase font-black">Hold Active</p>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col bg-white border rounded-[2.5rem] shadow-xl overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-5 border-b flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-[#225BC3]/10"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
              <h3 className="font-black text-[#225BC3] uppercase tracking-tight">Alex Rivera <VerifiedBadge /></h3>
            </div>
            <Badge className="bg-[#225BC3] text-white border-none px-4 py-1.5 flex items-center gap-2 rounded-full uppercase text-[9px] font-black tracking-widest">
              <Lock className="w-3 h-3 text-[#34CBED]" /> Protected Hold
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {/* Risk Engine Warnings */}
            {scamWarning && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-3xl animate-in slide-in-from-top-4">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertTitle className="font-black uppercase text-[10px] tracking-widest text-red-700">High Risk Indicator ({scamWarning.riskScore}%)</AlertTitle>
                <AlertDescription className="text-xs font-medium text-red-600 leading-relaxed">
                  {scamWarning.reason}
                </AlertDescription>
              </Alert>
            )}

            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col max-w-[80%] space-y-1", m.senderId === "buyer" ? "ml-auto items-end" : "items-start")}>
                <div className={cn("px-5 py-3 rounded-[1.5rem] text-sm shadow-sm", m.senderId === "buyer" ? "bg-[#225BC3] text-white rounded-tr-none" : "bg-white border border-slate-100 rounded-tl-none")}>{m.text}</div>
                <div className="flex items-center gap-2">
                   {m.riskScore && m.riskScore > 30 && <ShieldAlert className="w-3 h-3 text-orange-500" />}
                   <span className="text-[10px] text-muted-foreground font-bold">{m.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t bg-white space-y-4">
            <div className="flex gap-3">
              <Input 
                placeholder="Secure marketplace chat..." 
                className="rounded-full bg-slate-50 border-none h-14 px-6 font-medium" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && handleSend()} 
              />
              <Button size="icon" className="rounded-full bg-[#225BC3] shrink-0 h-14 w-14" onClick={handleSend} disabled={isSending}>
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 opacity-40">
               <ShieldCheck className="w-3 h-3 text-[#34CBED]" />
               <span className="text-[8px] font-black uppercase tracking-widest">AI Threat Monitor: active</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
