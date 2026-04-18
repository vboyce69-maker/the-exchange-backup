
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
  CheckCircle2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LegalHub() {
  const handleDownloadIP = () => {
    toast({
      title: "Compliance Portfolio Generated",
      description: "Policy document prepared for review.",
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
              <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter uppercase">Legal & Compliance Hub</h1>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Version 1.0.0 | POPIA & CPA COMPLIANT</p>
            </div>
            <Button 
              className="bg-[#225BC3] text-white font-black rounded-2xl h-12 gap-2 shadow-xl hover:scale-105 transition-transform"
              onClick={handleDownloadIP}
            >
              <Download className="w-4 h-4" />
              Export Full Policy (PDF)
            </Button>
          </div>

          <Tabs defaultValue="tos" className="w-full">
            <TabsList className="bg-white p-1 rounded-3xl h-16 w-full lg:w-fit shadow-lg mb-8 overflow-x-auto scrollbar-hide">
              <TabsTrigger value="tos" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Privacy Policy</TabsTrigger>
              <TabsTrigger value="scam" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Anti-Scam</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Escrow & Fees</TabsTrigger>
              <TabsTrigger value="verification" className="rounded-2xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#225BC3] data-[state=active]:text-white">Verification</TabsTrigger>
            </TabsList>

            {/* Terms of Service */}
            <TabsContent value="tos">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center gap-3">
                    <Gavel className="w-8 h-8" /> 1. Terms of Service
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    By accessing 'The Exchange' Marketplace, you agree to be bound by these terms. This platform acts as a neutral venue for buyers and sellers to connect.
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
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Prohibited Items</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Illegal substances, firearms, counterfeit currency, and stolen property are strictly prohibited. Listing such items results in immediate permanent ban and police reporting.
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

            {/* Privacy Policy */}
            <TabsContent value="privacy">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center gap-3">
                    <Fingerprint className="w-8 h-8" /> 2. Privacy & Data Handling
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    We take your privacy seriously. All processing is conducted in accordance with the Protection of Personal Information Act (POPIA).
                  </p>
                </div>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                  <ShieldCheck className="w-10 h-10 text-[#225BC3] shrink-0" />
                  <div className="space-y-2">
                    <p className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Biometric Data Protection</p>
                    <p className="text-sm text-blue-700 font-medium leading-relaxed">
                      Facial scans and ID photos are encrypted at rest and in transit. This data is used solely for identity verification and fraud prevention. We do not sell your biometric data to third parties.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-black text-xs text-slate-900">Data Collection</h4>
                    <p className="text-xs text-slate-500 font-medium">Phone number, location data, and browsing history are used to personalize and secure your marketplace experience.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-xs text-slate-900">Your Rights</h4>
                    <p className="text-xs text-slate-500 font-medium">You have the right to request access to, correction of, or deletion of your personal information at any time.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-xs text-slate-900">Secure Storage</h4>
                    <p className="text-xs text-slate-500 font-medium">Data is hosted on Google Cloud infrastructure with enterprise-grade firewalls and access controls.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Anti-Scam Policy */}
            <TabsContent value="scam">
              <Card className="rounded-[3rem] border-none shadow-xl bg-red-600 p-10 text-white space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-white animate-pulse" /> 3. Anti-Scam Policy
                  </h2>
                  <p className="text-white/90 font-black text-lg">
                    ZERO TOLERANCE FOR FRAUDULENT ACTIVITY.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-black/10 rounded-3xl border border-white/20 space-y-3">
                    <h4 className="font-black uppercase text-xs tracking-widest">Off-Platform Redirection</h4>
                    <p className="text-sm opacity-80 leading-relaxed">
                      Asking users to communicate on WhatsApp or pay via direct bank transfer (avoiding our "Protected Hold") is a violation of our safety rules.
                    </p>
                  </div>
                  <div className="p-6 bg-black/10 rounded-3xl border border-white/20 space-y-3">
                    <h4 className="font-black uppercase text-xs tracking-widest">Fake Proof of Payment</h4>
                    <p className="text-sm opacity-80 leading-relaxed">
                      Sending altered screenshots of SMS notifications or bank receipts is a criminal offense and will be reported to the SAPS immediately.
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-white/10 rounded-[2.5rem] border border-white/10">
                   <p className="text-xs font-bold leading-relaxed">
                     NOTICE: Any user found to be engaging in "Advance Fee" scams (asking for insurance/courier money before a trade) will have their account permanently locked and their biometric data shared with fraud-prevention databases.
                   </p>
                </div>
              </Card>
            </TabsContent>

            {/* Escrow & Payments */}
            <TabsContent value="payments">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center gap-3">
                    <Lock className="w-8 h-8 text-[#34CBED]" /> 4. Protected Hold (Escrow)
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Our payment system is designed to prevent "No-Show" and "Empty Box" scams by holding funds until the physical trade is complete.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Service Fee</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">An 8-10% commission is applied to all successful trades to fund our security AI and safe zone vetting.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <Clock className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Hold Period</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">Funds are held for a maximum of 48 hours post-payment. If no meetup occurs, funds are returned to the buyer.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Finality</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">Once the Seller marks as "Delivered" and the Buyer confirms, the transaction is FINAL and non-refundable.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Seller Verification Rules */}
            <TabsContent value="verification">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter flex items-center gap-3">
                    <UserCheck className="w-8 h-8 text-[#34CBED]" /> 5. Seller Verification Rules
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    To maintain a high-trust community, verified sellers must adhere to strict identity and behavioral standards.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-[#225BC3] shrink-0 font-black">1</div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Identity Authenticity</h4>
                      <p className="text-sm text-slate-500 font-medium">Your provided ID must match your live biometric scan. Using a proxy or relative's ID is grounds for immediate rejection.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-[#225BC3] shrink-0 font-black">2</div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Reliability Maintenance</h4>
                      <p className="text-sm text-slate-500 font-medium">A "Reliability Score" below 40% will lead to the temporary suspension of your verified status and visibility in search results.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-[#225BC3] shrink-0 font-black">3</div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Safe Zone Commitment</h4>
                      <p className="text-sm text-slate-500 font-medium">High-value trades (over R5000) must be conducted at vetted Safe Zones to maintain platform-backed safety coverage.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Legal Notes */}
          <div className="text-center space-y-4 opacity-50 pb-12">
            <div className="flex items-center justify-center gap-6">
               <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#225BC3]"><Building2 className="w-3 h-3" /> Registered in RSA</div>
               <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#225BC3]"><Scale className="w-3 h-3" /> CPA Compliant</div>
               <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#225BC3]"><Copyright className="w-3 h-3" /> 2024 The Exchange</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function UserCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
