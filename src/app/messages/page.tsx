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
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
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
  const { checkContent, isValidating } = useScamDetection();

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", senderId: "seller", text: "Hey! Are you still interested in the Mountain Bike?", timestamp: "10:30 AM" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [scamAudit, setScamAudit] = useState<any>(null);

  const handleSend = async () => {
    if (!inputValue.trim() || isValidating) return;

    // 1. Run Advanced Multi-Layered Security Check
    const result = await checkContent(inputValue);
    
    if (!result) return;

    // 2. Log Moderation Event to Firestore (Moderation Queue)
    if (result.decision === 'block' || result.decision === 'flag') {
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

    // 3. Reject if blocked
    if (result.decision === 'block') {
      setScamAudit(result);
      return; 
    }

    // 4. Update UI with warning if flagged
    if (result.decision === 'flag') {
      setScamAudit(result);
    } else {
      setScamAudit(null);
    }

    // 5. Append message
    setMessages([...messages, { 
      id: Date.now().toString(), 
      senderId: "buyer", 
      text: inputValue, 
      timestamp: "Now",
      riskScore: result.riskScore
    }]);
    setInputValue("");
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
              <p className="text-[10px] text-muted-foreground truncate uppercase font-black">Escrow Active</p>
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
            {scamAudit && scamAudit.decision !== 'allow' && (
              <Alert variant="destructive" className={cn("rounded-3xl animate-in slide-in-from-top-4", scamAudit.decision === 'block' ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200")}>
                <AlertTriangle className={cn("h-5 w-5", scamAudit.decision === 'block' ? "text-red-600" : "text-orange-600")} />
                <AlertTitle className={cn("font-black uppercase text-[10px] tracking-widest", scamAudit.decision === 'block' ? "text-red-700" : "text-orange-700")}>
                  Security Risk: {scamAudit.decision.toUpperCase()} (Score: {scamAudit.riskScore})
                </AlertTitle>
                <AlertDescription className={cn("text-xs font-medium leading-relaxed", scamAudit.decision === 'block' ? "text-red-600" : "text-orange-600")}>
                  {scamAudit.reason}
                </AlertDescription>
              </Alert>
            )}

            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col max-w-[80%] space-y-1", m.senderId === "buyer" ? "ml-auto items-end" : "items-start")}>
                <div className={cn("px-5 py-3 rounded-[1.5rem] text-sm shadow-sm", m.senderId === "buyer" ? "bg-[#225BC3] text-white rounded-tr-none" : "bg-white border border-slate-100 rounded-tl-none")}>{m.text}</div>
                <div className="flex items-center gap-2">
                   {m.riskScore && m.riskScore >= 4 && <ShieldAlert className="w-3 h-3 text-orange-500" />}
                   <span className="text-[10px] text-muted-foreground font-bold">{m.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t bg-white space-y-4">
            <div className="flex gap-3">
              <Input 
                placeholder="Type a message..." 
                className="rounded-full bg-slate-50 border-none h-14 px-6 font-medium" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && handleSend()} 
              />
              <Button size="icon" className="rounded-full bg-[#225BC3] shrink-0 h-14 w-14" onClick={handleSend} disabled={isValidating}>
                {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 opacity-40">
               <ShieldCheck className="w-3 h-3 text-[#34CBED]" />
               <span className="text-[8px] font-black uppercase tracking-widest">Falcon AI Protection Enabled</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
