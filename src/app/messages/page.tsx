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
  AlertTriangle,
  Cpu,
  Zap,
  Navigation as NavIcon,
  MapPin,
  Car,
  X,
  Star,
  CheckCircle2
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

  const handleSend = async () => {
    if (!inputValue.trim() || isValidating) return;

    // Layered Security Architecture Trigger
    const result = await checkContent(inputValue);

    if (!result) return;

    // Log high-risk events to moderation queue
    if (result.decision === 'block' || result.decision === 'hold') {
      addDocumentNonBlocking(collection(db, "moderationQueue"), {
        userId: user?.uid || "anonymous",
        content: inputValue,
        normalizedContent: result.audit.normalizedText,
        riskScore: result.riskScore,
        decision: result.decision,
        reason: result.reason,
        aiUsed: result.aiAnalysisPerformed,
        timestamp: new Date().toISOString(),
        status: 'pending_review'
      });
    }

    if (result.decision === 'block') {
      setScamAudit(result);
      // DO NOT send message if blocked
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

  const startMeetup = () => {
    setIsMeetupActive(true);
    toast({
      title: "Meetup Tracker Active",
      description: "Sharing live proximity to Rosebank SAPS Safe Zone.",
    });
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
            <div className="p-5 bg-blue-50/50 border-l-4 border-[#225BC3] flex gap-3 cursor-pointer">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm">Alex Rivera</span>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-black">Protected Hold Active</p>
              </div>
            </div>

            {/* Trust Summary Section */}
            <div className="p-6 border-t space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Trust Profile</h3>
                  <Badge className="bg-green-100 text-green-700 border-none font-black text-[8px] uppercase px-2">High Reliability</Badge>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => router.push('/profile/seller_id')}>
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 * (1 - 0.94)} className="text-[#225BC3]" />
                    </svg>
                    <span className="absolute text-[10px] font-black text-[#225BC3]">94%</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-none">Reliability Score</p>
                    <p className="text-[9px] text-slate-500 font-bold mt-1">Based on 56 successful meetups</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Verified Reviews</h3>
                  <button 
                    className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#225BC3] transition-colors"
                    onClick={() => router.push('/profile/seller_id')}
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { user: "Sarah M.", text: "Excellent trader, arrived on time at the safe zone." },
                    { user: "David K.", text: "Item was exactly as described. Very professional." }
                  ].map((review, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-900 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" /> {review.user}
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-2 h-2 text-[#FF8C00] fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight italic font-medium">"{review.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col bg-white border rounded-[2.5rem] shadow-xl overflow-hidden h-[calc(100vh-10rem)]">
          <div className="p-5 border-b flex items-center justify-between bg-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="border-2 border-[#225BC3]/10"><AvatarImage src="https://picsum.photos/seed/user1/200/200" /></Avatar>
              <h3 className="font-black text-[#225BC3] uppercase tracking-tight">Alex Rivera <VerifiedBadge /></h3>
            </div>
            <div className="flex items-center gap-3">
              {!isMeetupActive ? (
                <Button
                  size="sm"
                  className="bg-[#FF8C00] text-white font-black rounded-full h-9 px-4 text-[9px] uppercase tracking-widest gap-2 shadow-lg hover:scale-105 transition-transform"
                  onClick={startMeetup}
                >
                  <NavIcon className="w-3.5 h-3.5" /> Start Tracker
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 font-black rounded-full h-9 px-4 text-[9px] uppercase tracking-widest gap-2 hover:bg-slate-50"
                  onClick={() => setIsMeetupActive(false)}
                >
                  <X className="w-3.5 h-3.5" /> Close Tracker
                </Button>
              )}
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
                  onArrival={(role) => console.log(`${role} arrived`)}
                />
              </div>
            )}

            {scamAudit && scamAudit.decision !== 'allow' && (
              <Alert variant="destructive" className={cn(
                "rounded-3xl animate-in slide-in-from-top-4",
                scamAudit.decision === 'block' ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl shrink-0",
                    scamAudit.decision === 'block' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                  )}>
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <AlertTitle className="font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                      {scamAudit.aiAnalysisPerformed && <Cpu className="w-3 h-3 text-blue-500" />}
                      {scamAudit.decision === 'block' ? "Policy Violation Block" : "Verification Required"}
                    </AlertTitle>
                    <AlertDescription className="text-xs font-medium leading-relaxed">
                      {scamAudit.reason}
                    </AlertDescription>
                    {scamAudit.aiAnalysisPerformed && (
                      <p className="text-[8px] font-black uppercase text-blue-600 tracking-tighter mt-2">
                        Deep Intent Analysis Performed by Falcon AI
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
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
                   {m.riskScore && m.riskScore >= 30 && (
                     <Badge variant="ghost" className="h-5 px-2 bg-slate-100 border-none text-slate-400 gap-1 rounded-full text-[8px] font-black">
                       {m.aiAnalyzed ? <Cpu className="w-2 h-2 text-blue-500" /> : <Zap className="w-2 h-2" />}
                       Audit: {m.riskScore}
                     </Badge>
                   )}
                   <span className="text-[10px] text-muted-foreground font-bold">{m.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t bg-white space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder={scamAudit?.decision === 'block' ? "Message blocked by security policy" : "Type a message..."}
                disabled={scamAudit?.decision === 'block'}
                className="rounded-full bg-slate-50 border-none h-14 px-6 font-medium"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (scamAudit) setScamAudit(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" className="rounded-full bg-[#225BC3] shrink-0 h-14 w-14" onClick={handleSend} disabled={isValidating || scamAudit?.decision === 'block'}>
                {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 opacity-40">
               <ShieldCheck className="w-3 h-3 text-[#34CBED]" />
               <span className="text-[8px] font-black uppercase tracking-widest">In-App Protection: External Contacts Blocked</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
