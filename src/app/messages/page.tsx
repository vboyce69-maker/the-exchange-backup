"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useScamDetection } from "@/hooks/use-scam-detection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldAlert,
  Send,
  ShieldCheck,
  Lock,
  Loader2,
  Globe,
  Zap,
  Navigation as NavIcon,
  X,
  Star,
  CheckCircle2,
  Banknote
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { LiveMeetupTracker } from "@/components/LiveMeetupTracker";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  riskScore?: number;
  aiAnalyzed?: boolean;
}

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { checkContent, isValidating } = useScamDetection();

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", senderId: "seller", text: "Hey! Are you still interested in the Mountain Bike?", timestamp: "10:30 AM" },
    { id: "2", senderId: "buyer", text: "Yes, I am. Can we meet at the Rosebank SAPS Safe Zone tomorrow?", timestamp: "10:32 AM" },
    { id: "3", senderId: "seller", text: "That works for me. I've initiated the Protected Hold for the payment.", timestamp: "10:35 AM" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [scamAudit, setScamAudit] = useState<any>(null);
  const [isMeetupActive, setIsMeetupActive] = useState(false);
  const [bothArrived, setBothArrived] = useState(false);
  const [isReleasing, setIsReconnecting] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || isValidating) return;

    const result = await checkContent(inputValue);

    if (!result) return;

    if (result.decision === 'block' || result.decision === 'hold') {
      addDocumentNonBlocking(collection(db, "moderationQueue"), {
        userId: user?.uid || "anonymous",
        content: inputValue,
        normalizedContent: result.audit.normalizedText,
        riskScore: result.riskScore,
        decision: result.decision,
        reason: result.reason,
        timestamp: new Date().toISOString(),
        status: 'pending_review'
      });
    }

    if (result.decision === 'block') {
      setScamAudit(result);
      return;
    }

    setScamAudit(result.decision !== 'allow' ? result : null);

    setMessages([...messages, {
      id: Date.now().toString(),
      senderId: "buyer",
      text: inputValue,
      timestamp: "Now",
      riskScore: result.riskScore,
      aiAnalyzed: result.aiAnalysisPerformed
    }]);
    setInputValue("");
  };

  const handleReleaseFunds = () => {
    setIsReconnecting(true);
    setTimeout(() => {
      setIsReconnecting(false);
      toast({
        title: "Transaction Complete",
        description: "Funds released to seller. Thank you for using The Exchange.",
      });
      router.push('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-80 bg-white border rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-[#225BC3]/5 flex items-center justify-between">
            <h2 className="font-black text-lg text-[#225BC3] uppercase tracking-tighter">Inbox</h2>
            <Globe className="w-4 h-4 text-[#34CBED]" />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 bg-blue-50/50 border-l-4 border-[#225BC3] flex gap-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm">Alex Rivera</span>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-black text-[#FF8C00]">Protected Hold Active</p>
              </div>
            </div>
          </div>

          {bothArrived && (
            <div className="p-6 border-t bg-slate-50 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest">Final Step</p>
              <Button 
                className="w-full bg-green-600 text-white font-black h-12 rounded-xl shadow-lg gap-2"
                onClick={handleReleaseFunds}
                disabled={isReleasing}
              >
                {isReleasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                Release Funds
              </Button>
              <p className="text-[8px] text-center text-slate-500 font-medium mt-3 italic">Only release once you have inspected the item.</p>
            </div>
          )}
        </aside>

        <div className="flex-1 flex flex-col bg-white border rounded-[2.5rem] shadow-xl overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-5 border-b flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-[#225BC3]/10"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
              <h3 className="font-black text-[#225BC3] uppercase tracking-tight">Alex Rivera <VerifiedBadge /></h3>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className={cn(
                  "font-black rounded-full h-9 px-4 text-[9px] uppercase tracking-widest gap-2 shadow-lg transition-all",
                  isMeetupActive ? "bg-slate-100 text-slate-400" : "bg-[#FF8C00] text-white"
                )}
                onClick={() => setIsMeetupActive(!isMeetupActive)}
              >
                {isMeetupActive ? <X className="w-3.5 h-3.5" /> : <NavIcon className="w-3.5 h-3.5" />}
                {isMeetupActive ? "Close Tracker" : "Start Tracker"}
              </Button>
              <Badge className="bg-[#225BC3] text-white border-none px-4 py-1.5 flex items-center gap-2 rounded-full uppercase text-[9px] font-black tracking-widest">
                <Lock className="w-3 h-3 text-[#34CBED]" /> Secure Trade
              </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {isMeetupActive && (
              <div className="mb-8 sticky top-0 z-20">
                <LiveMeetupTracker
                  buyerName="You"
                  sellerName="Alex Rivera"
                  safeZoneName="Rosebank SAPS Safe Zone"
                  onArrival={(role) => {
                    if (role === 'buyer') toast({ title: "Welcome to Safe Zone", description: "You have arrived at the Rosebank SAPS point." });
                    setBothArrived(true);
                  }}
                />
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col max-w-[80%] space-y-1", m.senderId === "buyer" ? "ml-auto items-end" : "items-start")}>
                <div className={cn(
                  "px-5 py-3 rounded-[1.5rem] text-sm shadow-sm",
                  m.senderId === "buyer" ? "bg-[#225BC3] text-white rounded-tr-none" : "bg-white border border-slate-100 rounded-tl-none"
                )}>
                  {m.text}
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-muted-foreground font-bold">{m.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t bg-white">
            <div className="flex gap-3">
              <Input
                placeholder="Type a message..."
                className="rounded-full bg-slate-50 border-none h-14 px-6 font-medium"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" className="rounded-full bg-[#225BC3] shrink-0 h-14 w-14 shadow-lg shadow-blue-500/20" onClick={handleSend} disabled={isValidating}>
                {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
