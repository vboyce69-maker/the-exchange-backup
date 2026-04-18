
"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  Award,
  Smartphone,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export default function ReferralPage() {
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setReferralCode(`EXCH-${user.uid.substring(0, 6).toUpperCase()}`);
    }
  }, [user]);

  const copyToClipboard = () => {
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
    { target: 1, reward: "Founding Member Badge", status: "completed" },
    { target: 5, reward: "3x Free Listing Boosts", status: "in-progress" },
    { target: 10, reward: "Verified Pro Status (No Fee)", status: "locked" },
    { target: 25, reward: "R500 Trade Credit", status: "locked" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Hero Promo */}
          <div className="bg-[#225BC3] rounded-[3.5rem] p-10 lg:p-16 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
             <div className="relative z-10 space-y-6">
                <Badge className="bg-[#34CBED] text-white border-none px-4 py-1 text-[10px] font-black uppercase tracking-widest">Viral Growth Engine</Badge>
                <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-none">Refer & <span className="text-[#34CBED]">Earn Trade</span></h1>
                <p className="text-xl text-white/80 font-bold max-w-xl">Invite sellers to 'The Exchange' and unlock premium features, trade credits, and boosted visibility.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Share Card */}
            <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-xl bg-white p-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-[#225BC3]">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Referral Link</h3>
                    <p className="text-sm text-slate-500 font-medium">Sellers who join with this link get 'Founding 1000' perks.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="flex-1 font-mono text-sm text-[#225BC3] truncate font-bold px-4">
                    {window.location.origin}/login?ref={referralCode || "..."}
                  </div>
                  <Button 
                    onClick={copyToClipboard}
                    className="rounded-2xl bg-[#225BC3] text-white font-black px-6 h-12"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-12">
                 <div className="p-6 bg-slate-50 rounded-3xl text-center">
                    <p className="text-3xl font-black text-[#225BC3]">0</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Invites Sent</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl text-center">
                    <p className="text-3xl font-black text-green-600">0</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Successful</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl text-center">
                    <p className="text-3xl font-black text-[#FF8C00]">R 0</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Earned</p>
                 </div>
              </div>
            </Card>

            {/* Reward Milestones */}
            <Card className="rounded-[3rem] border-none shadow-xl bg-white p-8">
               <CardHeader className="p-0 mb-6">
                 <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                    <Award className="w-6 h-6 text-[#FF8C00]" /> Rewards
                 </CardTitle>
               </CardHeader>
               <div className="space-y-6">
                 {milestones.map((m, i) => (
                   <div key={i} className={`p-4 rounded-2xl border ${m.status === 'completed' ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invite {m.target}</span>
                        {m.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className={`font-black text-sm ${m.status === 'locked' ? 'text-slate-300' : 'text-slate-900'}`}>{m.reward}</p>
                   </div>
                 ))}
                 <div className="pt-4">
                   <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                     Rewards are issued 24h after the invitee completes Pillar 2 Verification.
                   </p>
                 </div>
               </div>
            </Card>
          </div>

          {/* Viral Strategy Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
             <div className="p-10 bg-white rounded-[3rem] shadow-lg border border-slate-50 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-[#225BC3]"><MessageSquare className="w-6 h-6" /></div>
                <h4 className="text-xl font-black uppercase tracking-tight">1. Share</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Send your link to business owners or peers with high-value items.</p>
             </div>
             <div className="p-10 bg-white rounded-[3rem] shadow-lg border border-slate-50 space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#FF8C00]"><Users className="w-6 h-6" /></div>
                <h4 className="text-xl font-black uppercase tracking-tight">2. Verify</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Once they complete identity verification, you unlock your milestone.</p>
             </div>
             <div className="p-10 bg-white rounded-[3rem] shadow-lg border border-slate-50 space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600"><Gift className="w-6 h-6" /></div>
                <h4 className="text-xl font-black uppercase tracking-tight">3. Earn</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Trade credits are applied automatically to your next 'Protected Hold' checkout.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
