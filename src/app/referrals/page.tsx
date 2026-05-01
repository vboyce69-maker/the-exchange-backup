"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Zap,
  Award,
  MessageSquare,
  ArrowRight,
  Star,
  Trophy,
  Rocket
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";

export default function ReferralPage() {
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setReferralCode(`EXCH-${user.uid.substring(0, 6).toUpperCase()}`);
    }
  }, [user]);

  const copyToClipboard = () => {
    if (typeof window === 'undefined') return;
    const link = `${window.location.origin}/login?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share this with potential sellers to earn rewards.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const milestones = [
    { target: 1, reward: "Founding Member Badge", description: "Earn a permanent badge on your profile.", status: "completed" },
    { target: 3, reward: "Free Featured Listing", description: "Boost any item to the top for 48 hours.", status: "in-progress" },
    { target: 5, reward: "3x Listing Boosts", description: "Get a pack of visibility power-ups.", status: "locked" },
    { target: 10, reward: "Verified Pro Status", description: "Lifetime zero listing fees (post-founding).", status: "locked" },
    { target: 25, reward: "R1000 Trade Credit", description: "Direct credit for your next purchase.", status: "locked" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12">
          
          {/* Hero Promo - COMPACT VERSION */}
          <div className="bg-[#225BC3] rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl min-h-[220px] flex items-center">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
             <div className="relative z-10 space-y-4 lg:space-y-6 text-center lg:text-left w-full lg:w-auto">
                <div className="inline-flex items-center gap-2 bg-[#34CBED] text-white px-4 py-1.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-lg mx-auto lg:mx-0">
                   <Rocket className="w-3 h-3" /> Viral Growth Engine
                </div>
                <h1 className="text-2xl lg:text-4xl font-black tracking-tighter uppercase leading-none">Refer & <span className="text-[#34CBED]">Grow</span></h1>
                <p className="text-base lg:text-lg text-white/80 font-bold max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Join the movement. Invite 3 friends to unlock your first **Free Featured Listing**.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Share Card */}
            <Card className="lg:col-span-7 rounded-[2.5rem] lg:rounded-[3rem] border-none shadow-xl bg-white p-6 lg:p-10 flex flex-col justify-between ring-1 ring-slate-100">
              <div className="space-y-6 lg:space-y-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6 text-center lg:text-left">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-[1.2rem] lg:rounded-[1.5rem] flex items-center justify-center text-[#225BC3] shadow-inner shrink-0">
                    <Share2 className="w-6 h-6 lg:w-8 lg:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight">Your Unique Invite Link</h3>
                    <p className="text-xs lg:text-sm text-slate-500 font-medium">Invited sellers get "Founding 1000" perks automatically.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 lg:p-4 bg-slate-50 rounded-3xl lg:rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <div className="flex-1 font-mono text-[10px] lg:text-sm text-[#225BC3] truncate font-black px-4 w-full text-center sm:text-left">
                    {mounted ? `${window.location.origin}/login?ref=${referralCode || "..."}` : '...'}
                  </div>
                  <Button 
                    onClick={copyToClipboard}
                    className="w-full sm:w-auto rounded-2xl bg-[#225BC3] text-white font-black px-8 h-12 lg:h-14 shadow-lg hover:scale-105 transition-transform"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5 mr-2" />}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 lg:gap-6 mt-10 lg:mt-16">
                 <div className="p-4 lg:p-8 bg-slate-50 rounded-2xl lg:rounded-[2.5rem] text-center border border-slate-100">
                    <p className="text-2xl lg:text-4xl font-black text-[#225BC3]">0</p>
                    <p className="text-[7px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Invites</p>
                 </div>
                 <div className="p-4 lg:p-8 bg-slate-50 rounded-2xl lg:rounded-[2.5rem] text-center border border-slate-100">
                    <p className="text-2xl lg:text-4xl font-black text-green-600">0</p>
                    <p className="text-[7px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Verified</p>
                 </div>
                 <div className="p-4 lg:p-8 bg-slate-50 rounded-2xl lg:rounded-[2.5rem] text-center border border-slate-100">
                    <p className="text-2xl lg:text-4xl font-black text-[#FF8C00]">R 0</p>
                    <p className="text-[7px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Credits</p>
                 </div>
              </div>
            </Card>

            {/* Reward Milestones */}
            <Card className="lg:col-span-5 rounded-[2.5rem] lg:rounded-[3rem] border-none shadow-xl bg-white p-6 lg:p-10 ring-1 ring-slate-100">
               <div className="flex items-center gap-3 mb-6 lg:mb-8">
                  <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-[#FF8C00]" />
                  <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight">Milestone Rewards</h2>
               </div>
               
               <div className="space-y-4 lg:space-y-6">
                 {milestones.map((m, i) => (
                   <div key={i} className={cn(
                     "p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border transition-all relative overflow-hidden",
                     m.status === 'completed' ? 'bg-green-50 border-green-100' : 
                     m.status === 'in-progress' ? 'bg-blue-50 border-blue-100 ring-2 ring-blue-200' :
                     'bg-white border-slate-100 opacity-60'
                   )}>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={cn(
                          "text-[7px] lg:text-[8px] font-black uppercase px-2 py-0.5 border-none",
                          m.status === 'completed' ? 'bg-green-200 text-green-700' :
                          m.status === 'in-progress' ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-400'
                        )}>
                           {m.target} {m.target === 1 ? 'Invite' : 'Invites'}
                        </Badge>
                        {m.status === 'completed' && <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />}
                        {m.status === 'in-progress' && <Star className="w-4 h-4 lg:w-5 lg:h-5 text-[#225BC3] animate-pulse" />}
                      </div>
                      <p className="font-black text-sm lg:text-base text-slate-900">{m.reward}</p>
                      <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 mt-1">{m.description}</p>
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
