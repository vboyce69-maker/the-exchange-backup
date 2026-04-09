
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Scale, 
  Lock, 
  Eye, 
  Gavel, 
  AlertTriangle, 
  FileText,
  Copyright,
  Fingerprint
} from "lucide-react";

export default function LegalHub() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter uppercase">Legal & Compliance Hub</h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">South African Regulatory Framework (CPA, POPIA, ECTA)</p>
          </div>

          {/* INTELLECTUAL PROPERTY & COPYRIGHT */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-[#225BC3] p-8 text-white">
              <CardTitle className="flex items-center gap-3">
                <Copyright className="w-6 h-6 text-[#34CBED]" />
                Intellectual Property Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-slate-600 leading-relaxed font-medium text-sm">
                  The Exchange marketplace platform, including its source code, unique algorithms (Reliability Scoring), biometric verification workflows, user interface design, and AI Genkit flows, are the exclusive intellectual property of <strong>The Exchange Marketplace (Pty) Ltd</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest mb-1">Copyright Protection</p>
                    <p className="text-[10px] text-slate-500">Protected as a literary and artistic work under the South African Copyright Act (1978). Unauthorized replication of code or style is strictly prohibited.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest mb-1">Trademark Status</p>
                    <p className="text-[10px] text-slate-500">"The Exchange" name, logo, and "Premium Verified Marketplace" branding are pending trademarks under CIPC classes 35 and 42.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* E-COMMERCE BUSINESS DISCLOSURE (ECTA SECTION 43) */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50 p-8 border-b">
              <CardTitle className="flex items-center gap-3 text-[#225BC3]">
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
                    <p className="font-bold text-slate-700">2023/XXXXXX/07 (Pending CIPC)</p>
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
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Complaints & Disputes</p>
                    <p className="font-bold text-slate-700">resolutions@theexchange.co.za</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MARKETPLACE ROLE & LIABILITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#225BC3]">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="font-black text-xl text-[#225BC3]">Marketplace Role</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-sm mb-4">
                This app is a marketplace platform that connects independent buyers and sellers. Unless we clearly say otherwise, we do not own, inspect, store, or deliver listed items, and we do not act as the seller of goods.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Limitation of Liability</p>
                <p className="text-[10px] text-slate-400 mt-1">To the maximum extent permitted by law, the platform is not liable for losses arising from user listings, conduct, meetups, or third-party failures.</p>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-black text-xl text-[#225BC3]">No Platform Warranty</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-sm mb-4">
                Listings are created by users. To the fullest extent permitted by law, the platform does not give warranties about the quality, safety, legality, authenticity, or fitness of items.
              </p>
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">Prohibited Items</p>
                <p className="text-[10px] text-orange-600 mt-1">Stolen, counterfeit, unlawful, or dangerous goods are strictly prohibited and will be reported to SAPS.</p>
              </div>
            </Card>
          </div>

          {/* POPIA PRIVACY SUMMARY */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h3 className="font-black text-xl text-[#225BC3]">POPIA Privacy Notice</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-sm mb-6">
                We collect and process personal information (name, contact, location, biometrics) to operate the marketplace, support transactions, prevent fraud, and comply with legal obligations under the Protection of Personal Information Act.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-green-700 uppercase"><ShieldCheck className="w-4 h-4"/> Purpose Specification</div>
                <div className="flex items-center gap-2 text-[10px] font-black text-green-700 uppercase"><ShieldCheck className="w-4 h-4"/> Data Minimisation</div>
                <div className="flex items-center gap-2 text-[10px] font-black text-green-700 uppercase"><ShieldCheck className="w-4 h-4"/> Security Safeguards</div>
              </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
