
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Scale, Lock, Eye, Gavel } from "lucide-react";

export default function LegalHub() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter">Legal & Compliance Hub</h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">South African Regulatory Framework</p>
          </div>

          {/* ECTA SECTION 43 DISCLOSURES */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-[#225BC3] p-8 text-white">
              <CardTitle className="flex items-center gap-3">
                <Gavel className="w-6 h-6 text-[#34CBED]" />
                ECTA Section 43 Disclosures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Full Legal Name</p>
                    <p className="font-bold text-slate-700">The Exchange Marketplace (Pty) Ltd</p>
                  </div>
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Registration Number</p>
                    <p className="font-bold text-slate-700">2023/XXXXXX/07</p>
                  </div>
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Physical Address</p>
                    <p className="font-bold text-slate-700">123 Sandton Drive, Sandton, Johannesburg, 2196</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Official Contact</p>
                    <p className="font-bold text-slate-700">compliance@theexchange.co.za</p>
                  </div>
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Membership</p>
                    <p className="font-bold text-slate-700">The Direct Selling Association of SA</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CPA & POPIA SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-black text-xl text-[#225BC3]">POPIA Privacy</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-sm mb-4">
                We are committed to the Protection of Personal Information Act. Your biometric data and ID documents are encrypted and used solely for identity verification. We do not sell your personal data to third parties.
              </p>
              <ul className="space-y-2 text-[11px] font-bold text-[#225BC3] uppercase tracking-wide">
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> End-to-end Encryption</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Condition 4: Purpose Specification</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Right to Rectification</li>
              </ul>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="font-black text-xl text-[#225BC3]">CPA Rights</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-sm mb-4">
                In line with the Consumer Protection Act, sellers are required to provide accurate descriptions. The Exchange provides an escrow-style hold to protect your right to a quality item or a full refund.
              </p>
              <ul className="space-y-2 text-[11px] font-bold text-[#225BC3] uppercase tracking-wide">
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Implied Warranty of Quality</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Right to Fair Disclosure</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure Dispute Resolution</li>
              </ul>
            </Card>
          </div>

          <div className="bg-[#225BC3]/5 p-8 rounded-[2.5rem] border border-[#225BC3]/10">
             <h4 className="font-black text-[#225BC3] uppercase text-xs tracking-widest mb-2">Platform Disclaimer</h4>
             <p className="text-xs text-muted-foreground font-medium leading-relaxed">
               The Exchange acts as an intermediary platform facilitator under the ECTA. While we provide safety tools like biometric verification and secure safe-zones, we do not take title to the goods sold between users. Users are encouraged to meet in designated Safe Zones and verify items before releasing funds.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
