"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useScamDetection } from "@/hooks/use-scam-detection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  ShieldCheck,
  Lock,
  Loader2,
  Navigation as NavIcon,
  X,
  Banknote,
  MessageCircle,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiveMeetupTracker } from "@/components/LiveMeetupTracker";
import { cn } from "@/lib/utils";
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

function MessagesContent() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");
  const { checkContent, isValidating } = useScamDetection();
  const [mounted, setMounted] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [isMeetupActive, setIsMeetupActive] = useState(false);
  const [bothArrived, setBothArrived] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch threads
  const threadsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "chatThreads"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
    );
  }, [db, user]);

  const { data: threads, isLoading: isThreadsLoading } =
    useCollection(threadsQuery);

  // Fetch messages for active thread
  const messagesQuery = useMemoFirebase(() => {
    if (!threadId || !db) return null;
    return query(
      collection(db, "chatThreads", threadId, "messages"),
      orderBy("timestamp", "asc"),
    );
  }, [db, threadId]);

  const { data: messages } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isValidating || !threadId || !user || !db) return;

    const result = await checkContent(inputValue);
    if (!result || result.decision === "block") return;

    const msgData = {
      senderId: user.uid,
      text: inputValue,
      timestamp: serverTimestamp(),
      riskScore: result.riskScore,
      aiAnalyzed: result.aiAnalysisPerformed,
    };

    await addDoc(collection(db, "chatThreads", threadId, "messages"), msgData);
    await updateDoc(doc(db, "chatThreads", threadId), {
      lastMessage: inputValue,
      updatedAt: serverTimestamp(),
    });

    setInputValue("");
  };

  const handleReleaseFunds = () => {
    setIsReleasing(true);
    setTimeout(() => {
      setIsReleasing(false);
      toast({
        title: "Transaction Complete",
        description: "Funds released to seller.",
      });
      router.push("/");
    }, 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-120px)] lg:overflow-hidden">
        {/* Trade Session / Chat - Order 1 on mobile, 2 on desktop */}
        <div className="order-1 lg:order-2 flex-1 flex flex-col premium-card overflow-hidden min-h-[500px] lg:min-h-0">
          {threadId ? (
            <>
              <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-[#225BC3]/10">
                      <AvatarImage
                        src={`https://picsum.photos/seed/${threadId}/200/200`}
                      />
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] animate-pulse">🟢</span>
                      <h3 className="font-black text-[#225BC3] uppercase tracking-tighter leading-none">
                        Trade Session
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                        #TX-2026-{threadId.substring(0, 5).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-50 text-green-700 border-none px-2 py-0.5 font-black text-[7px] uppercase flex items-center gap-1">
                        <ShieldCheck className="w-2 h-2" /> Verified Seller
                      </Badge>
                      <Badge className="bg-blue-50 text-[#225BC3] border-none px-2 py-0.5 font-black text-[7px] uppercase flex items-center gap-1">
                        <ShieldCheck className="w-2 h-2" /> Escrow Protected
                      </Badge>
                      <Badge className="bg-[#FF8C00] text-white border-none px-2 py-0.5 font-black text-[7px] uppercase flex items-center gap-1">
                        <Lock className="w-2 h-2" /> Payment On Hold
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    className={cn(
                      "font-black rounded-full h-10 px-6 text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all",
                      isMeetupActive
                        ? "bg-slate-100 text-slate-400"
                        : "bg-[#FF8C00] text-white hover:scale-105",
                    )}
                    onClick={() => setIsMeetupActive(!isMeetupActive)}
                  >
                    {isMeetupActive ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <NavIcon className="w-4 h-4" />
                    )}
                    {isMeetupActive ? "End Tracker" : "Meet Seller"}
                  </Button>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20"
                ref={scrollRef}
              >
                {isMeetupActive && (
                  <div className="mb-10 sticky top-0 z-20">
                    <LiveMeetupTracker
                      buyerName="You"
                      sellerName="Seller"
                      safeZoneName="Secure Safe Zone"
                      onArrival={(role) => {
                        if (role === "buyer")
                          toast({
                            title: "Check-in Successful",
                            description: "Location verified at Safe Zone.",
                          });
                        setBothArrived(true);
                      }}
                    />
                  </div>
                )}

                {messages?.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col max-w-[75%] space-y-1.5",
                      m.senderId === user?.uid
                        ? "ml-auto items-end"
                        : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "px-6 py-4 rounded-[2rem] text-sm shadow-md transition-all relative group/bubble",
                        m.senderId === user?.uid
                          ? "bg-gradient-to-br from-primary to-[#225BC3] text-white rounded-tr-none shadow-blue-500/20"
                          : "bg-white border border-slate-100 rounded-tl-none shadow-slate-200/50",
                      )}
                    >
                      {m.text}
                      {m.senderId === user?.uid && (
                        <div className="absolute -bottom-1 right-2 flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5 text-blue-100 opacity-50" />
                          <ShieldCheck className="w-2.5 h-2.5 -ml-1 text-blue-100" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold px-2">
                      {m.timestamp
                        ? new Date(
                            m.timestamp.seconds * 1000,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Sending..."}
                    </span>
                  </div>
                ))}
              </div>

              {/* Security Indicators Bar */}
              <div className="px-8 py-3 bg-slate-50/50 flex flex-wrap justify-center gap-x-8 gap-y-2 border-y border-slate-100/50 shadow-inner">
                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                  <Lock className="w-2.5 h-2.5 text-[#225BC3]" /> 🔒 End-to-End Protected
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                  <ShieldCheck className="w-2.5 h-2.5 text-green-500" /> ✓ Identity Verified
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                  <ShieldCheck className="w-2.5 h-2.5 text-[#FF8C00]" /> ✓ Escrow Protected
                </div>
              </div>

              {bothArrived && (
                <div className="px-8 py-4 bg-green-50 border-t border-green-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                    Trade Conclusion Protocol
                  </p>
                  <Button
                    onClick={handleReleaseFunds}
                    disabled={isReleasing}
                    className="bg-green-600 text-white font-black rounded-xl h-10 px-6 gap-2"
                  >
                    {isReleasing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Banknote className="w-4 h-4" />
                    )}{" "}
                    Release Escrow
                  </Button>
                </div>
              )}

              <div className="p-8 border-t bg-white">
                <div className="flex gap-4 relative">
                  <Input
                    placeholder="Message about the trade..."
                    className="rounded-3xl bg-slate-50 border-none h-16 px-8 font-medium shadow-inner pr-20"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button
                    size="icon"
                    className="absolute right-2 top-2 rounded-2xl bg-[#225BC3] h-12 w-12 shadow-xl shadow-blue-500/20"
                    onClick={handleSend}
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center shadow-inner">
                <Inbox className="w-16 h-16 text-slate-100" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-xl font-black text-[#225BC3] uppercase tracking-tighter">
                  Select a Conversation
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  Click on a thread to view trade logs and initiate meetup
                  tracking.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Inbox / Sidebar - Order 2 on mobile, 1 on desktop */}
        <aside className="order-2 lg:order-1 w-full lg:w-96 premium-card overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
          <div className="p-8 border-b bg-[#225BC3]/5 flex items-center justify-between">
            <h2 className="font-black text-2xl text-[#225BC3] uppercase tracking-tighter">
              Inbox
            </h2>
            <Inbox className="w-5 h-5 text-[#34CBED]" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isThreadsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
              </div>
            ) : threads && threads.length > 0 ? (
              threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    router.push(`/messages?thread=${t.id}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "w-full p-6 rounded-3xl transition-all flex gap-4 text-left group",
                    threadId === t.id
                      ? "bg-blue-50 border-l-8 border-[#225BC3] shadow-md"
                      : "hover:bg-slate-50",
                  )}
                >
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${t.id}/200/200`}
                    />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-slate-900 uppercase truncate mb-1">
                      {t.listingTitle || "Trade Conversation"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">
                      {t.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-24 px-8 space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner ring-1 ring-slate-100">
                  <div className="relative">
                    <MessageCircle className="w-12 h-12 text-slate-200" />
                    <ShieldCheck className="absolute -top-1 -right-1 w-5 h-5 text-[#225BC3] bg-white rounded-full p-0.5 shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">
                    No active trade sessions
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed max-w-[200px] mx-auto">
                    Your verified trades will appear here. Start browsing trusted listings to initiate a trade.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-200 h-12 px-8 shadow-sm hover:bg-slate-50 transition-all"
                  onClick={() => router.push("/search")}
                >
                  Start Browsing
                </Button>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
            <Navigation />
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          </div>
        }
      >
        <MessagesContent />
      </Suspense>
    </AuthGuard>
  );
}
