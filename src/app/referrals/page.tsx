
"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Rocket,
  Trophy,
  Star,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function ReferralPage() {
  return (
    <AuthGuard>
      <ReferralContent />
    </AuthGuard>
  );
}

function ReferralContent() {
  const { user } = useUser();
  const db = useFirestore();
  const [copied, setCopied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const referralRef = useMemoFirebase(() => {
    return user ? doc(db, "referrals", user.uid) : null;
  }, [db, user]);

  const { data: referralData, isLoading } = useDoc(referralRef);

  useEffect(() => {
    async function initReferral() {
      if (!user || !db || !isLoading && referralData) {
        setIsInitializing(false);
        return;
      }
      
      try {
        const refDoc = doc(db, "referrals", user.uid);
        const snap = await getDoc(refDoc);
        
        if (!snap.exists()) {
          const code = `EXCH-${user.uid.substring(0, 6).toUpperCase()}`;
          await setDoc(refDoc, {
            referralCode: code,
            invites: [],
            credits: 0,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Referral Init Error:", err);
      } finally {
        setIsInitializing(false);
      }
    }
    initReferral();
  }, [user, db, referralData, isLoading]);

  const copyToClipboard = () => {
    if (!referralData) return;
    const link = `${window.location.origin}/login?ref=${referralData.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Link Copied!", description: "Share with potential sellers to earn rewards." });
    setTimeout(() => setCopied(false), 2000);
  };

  const milestones = [
    { target: 1, reward: "Founding Member Badge", status: (referralData?.invites?.length || 0) >= 1 ? "completed" : "locked" },
    { target: 3, reward: "Free Featured Listing", status: (referralData?.invites?.length || 0) >= 3 ? "completed" : "locked" },
    { target: 10, reward: "R500 Trade Credit", status: (referralData?.invites?.length || 0) >= 10 ? "completed" : "locked" },
  ];

  if (isInitializing) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="bg-[#225BC3] rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
             <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#34CBED] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                   <Rocket className="w-3 h-3" /> Growth Engine
                </div>
                <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none">Refer & <span className="text-[#34CBED]">Earn</span></h1>
                <p className="text-lg text-white/80 font-bold max-w-md leading-relaxed">Join the movement. Invite sellers to unlock lifetime perks.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-7 rounded-[3rem] border-none shadow-xl bg-white p-10 ring-1 ring-slate-100 flex flex-col justify-between">
              <div className="space-y-8">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Your Invite Hub</h3>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="flex-1 font-mono text-sm text-[#225BC3] truncate font-black px-4">
                    {referralData?.referralCode || "Generating..."}
                  </div>
                  <Button onClick={copyToClipboard} className="rounded-2xl bg-[#225BC3] text-white font-black px-8 h-14 hover:scale-105 transition-transform">
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5 mr-2" />} {copied ? "Copied" : "Copy Link"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-16">
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] text-center border border-slate-100">
                    <p className="text-4xl font-black text-[#225BC3]">{referralData?.invites?.length || 0}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Invites</p>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] text-center border border-slate-100">
                    <p className="text-4xl font-black text-green-600">R {referralData?.credits || 0}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Credits</p>
                 </div>
              </div>
            </Card>

            <Card className="lg:col-span-5 rounded-[3rem] border-none shadow-xl bg-white p-10 ring-1 ring-slate-100">
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Rewards</h2>
               <div className="space-y-6">
                 {milestones.map((m, i) => (
                   <div key={i} className={cn("p-6 rounded-[2rem] border transition-all", m.status === 'completed' ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100 opacity-60')}>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5 border-none", m.status === 'completed' ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-400')}>Target: {m.target}</Badge>
                        {m.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      </div>
                      <p className="font-black text-base text-slate-900">{m.reward}</p>
                   </div>
                 ))}
               </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
