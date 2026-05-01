"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Scale, 
  Lock, 
  Eye, 
  Gavel, 
  AlertTriangle, 
  FileText,
  Copyright,
  Fingerprint,
  Download,
  Zap,
  ShieldAlert,
  MapPin,
  Shield,
  Server,
  Building2,
  Database,
  Activity,
  Cpu,
  Globe,
  Info,
  CheckCircle2,
  Smartphone,
  ScanFace,
  FileCheck,
  Gift
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LegalHub() {
  const handleDownloadIP = () => {
    toast({
      title: "Policy Pack Exported",
      description: "Full compliance documentation ready.",
    });
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter uppercase">Compliance & Safety Hub</h1>
              <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">V 1.2.0 | POPIA, CPA & FICA COMPLIANT</p>
            </div>
            <Button 
              className="bg-[#225BC3] text-white font-black rounded-2xl h-12 gap-2 shadow-xl hover:scale-105 transition-transform"
              onClick={handleDownloadIP}
            >
              <Download className="w-4 h-4" />
              Download Policy Set
            </Button>
          </div>

          <Tabs defaultValue="verification" className="w-full">
            <TabsList className="bg-white p-1 rounded-3xl h-16 w-full lg:w-fit shadow-lg mb-8 overflow-x-auto scrollbar-hide">
              <TabsTrigger value="verification" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Verification</TabsTrigger>
              <TabsTrigger value="tos" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Privacy</TabsTrigger>
              <TabsTrigger value="rewards" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Referrals</TabsTrigger>
              <TabsTrigger value="scam" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Anti-Scam</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Protected Pay</TabsTrigger>
            </TabsList>

            {/* Verification Pillars */}
            <TabsContent value="verification">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center justify-center md:justify-start gap-3">
                    <ShieldCheck className="w-8 h-8 text-[#34CBED]" /> 4-Pillar Verification
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
                    To maintain a high-trust marketplace, all sellers must complete the following mandatory verification steps to ensure authenticity and legal compliance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#225BC3] shadow-sm">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">Pillar 1: Phone</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Secures your account via RSA mobile network OTP verification.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#225BC3] shadow-sm">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">Pillar 2: ID</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Validates government-issued ID documents against national databases.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#225BC3] shadow-sm">
                      <ScanFace className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">Pillar 3: Selfie</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">AI-driven biometric liveness check ensures you match your document.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#225BC3] shadow-sm">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">Pillar 4: Address</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Proof of residence validation to prevent localized fraud syndicates.</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-[#225BC3]/5 rounded-[2.5rem] border border-[#225BC3]/10">
                   <p className="text-[11px] font-black text-[#225BC3] uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Lock className="w-4 h-4" /> Identity Authenticity Clause
                   </p>
                   <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                     Your provided ID must match your live biometric scan. Failure to pass Pillar 3 (Biometric Match) or Pillar 4 (Residence) will result in immediate suspension of selling privileges. We reserve the right to share fraudulent identity attempts with the South African Fraud Prevention Service (SAFPS).
                   </p>
                </div>
              </Card>
            </TabsContent>

            {/* Terms of Service */}
            <TabsContent value="tos">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center gap-3">
                    <Gavel className="w-8 h-8" /> Terms of Service
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    By accessing 'The Exchange', you agree to be bound by these terms. This platform acts as a neutral venue for buyers and sellers to connect.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">User Eligibility</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      You must be at least 18 years old and a resident of South Africa to create an account. Business sellers must provide valid CIPC registration if requested.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Contractual Relationship</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      The contract of sale is strictly between the Buyer and Seller. The Exchange Marketplace (Pty) Ltd is NOT a party to the transaction.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Referral Rewards Policy */}
            <TabsContent value="rewards">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center gap-3">
                    <Gift className="w-8 h-8 text-pink-500" /> Referral Program Terms
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    The Referral System is designed to reward users who grow our community of trusted sellers.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-pink-50 rounded-3xl border border-pink-100">
                    <h4 className="font-black text-xs uppercase tracking-widest text-pink-900 mb-2">Abuse Prevention</h4>
                    <p className="text-[11px] text-pink-800 font-bold leading-relaxed">
                      Self-referrals, fake accounts, or duplicate identity documents used to farm referral rewards will result in immediate permanent ban and forfeiture of all trade credits.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="font-black text-[10px] uppercase text-slate-900 mb-1">Eligibility</p>
                        <p className="text-[10px] text-slate-500">Only verified users can earn trade credits from referrals.</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="font-black text-[10px] uppercase text-slate-900 mb-1">Expiration</p>
                        <p className="text-[10px] text-slate-500">Referral trade credits expire 90 days after issue.</p>
                     </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Privacy Policy */}
            <TabsContent value="privacy">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center gap-3">
                    <Fingerprint className="w-8 h-8" /> Privacy & Data Handling
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Processing is conducted in accordance with the Protection of Personal Information Act (POPIA).
                  </p>
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                  <ShieldCheck className="w-10 h-10 text-[#225BC3] shrink-0" />
                  <div className="space-y-2">
                    <p className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Biometric Protection</p>
                    <p className="text-sm text-blue-700 font-medium leading-relaxed">
                      Facial scans are encrypted at rest and in transit. This data is used solely for identity verification and fraud prevention. We do not sell your biometric data to third parties.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Anti-Scam Policy */}
            <TabsContent value="scam">
              <Card className="rounded-[3rem] border-none shadow-xl bg-red-600 p-10 text-white space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-white animate-pulse" /> Anti-Scam Policy
                  </h2>
                  <p className="text-white/90 font-black text-lg uppercase tracking-tight">
                    Zero tolerance for fraudulent activity. Off-platform deals are prohibited.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-black/10 rounded-3xl border border-white/20 space-y-3">
                    <h4 className="font-black uppercase text-xs tracking-widest">Off-Platform Redirection</h4>
                    <p className="text-sm opacity-80 leading-relaxed">
                      Asking users to communicate on WhatsApp or pay via direct bank transfer (avoiding our "Protected Hold") is a major violation.
                    </p>
                  </div>
                  <div className="p-6 bg-black/10 rounded-3xl border border-white/20 space-y-3">
                    <h4 className="font-black uppercase text-xs tracking-widest">Fake Proof of Payment</h4>
                    <p className="text-sm opacity-80 leading-relaxed">
                      Sending altered screenshots of SMS notifications is a criminal offense and results in permanent ban.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Payments & Escrow */}
            <TabsContent value="payments">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center gap-3">
                    <Lock className="w-8 h-8 text-[#34CBED]" /> Protected Hold (Escrow)
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Our system holds funds until the physical trade is complete at a Safe Zone.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Service Fee</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">A commission is applied to fund security AI and safe zone vetting.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <Clock className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Finality</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">Once marked as "Delivered" and the Buyer confirms, the transaction is FINAL.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center space-y-4 opacity-50 pb-12">
            <div className="flex items-center justify-center gap-6">
               <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#225BC3]"><Building2 className="w-3 h-3" /> Registered in RSA</div>
               <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#225BC3]"><Scale className="w-3 h-3" /> CPA & FICA Compliant</div>
               <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#225BC3]"><Copyright className="w-3 h-3" /> 2026 The Exchange</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Clock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
