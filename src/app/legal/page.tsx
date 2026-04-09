
"use client";

import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  MapPin
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LegalHub() {
  const handleDownloadIP = () => {
    toast({
      title: "IP Portfolio Generated",
      description: "You can now print this page to PDF for your CIPC records.",
    });
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter uppercase">Legal & Compliance Hub</h1>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Regulatory Framework: CPA, POPIA, ECTA</p>
            </div>
            <Button 
              className="bg-[#FF8C00] text-white font-black rounded-2xl h-12 gap-2 shadow-xl hover:scale-105 transition-transform"
              onClick={handleDownloadIP}
            >
              <Download className="w-4 h-4" />
              Download IP Portfolio
            </Button>
          </div>

          {/* INTELLECTUAL PROPERTY & UNIQUE FEATURES */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100 print:shadow-none">
            <CardHeader className="bg-[#225BC3] p-10 text-white">
              <CardTitle className="flex items-center gap-3">
                <Copyright className="w-8 h-8 text-[#34CBED]" />
                Proprietary IP Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-6">
                <p className="text-slate-600 leading-relaxed font-medium">
                  The following features are the exclusive intellectual property of <strong>The Exchange Marketplace (Pty) Ltd</strong> and are protected under South African Copyright and Trademark laws.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <Lock className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Protected Payment Hold</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                      Our proprietary escrow-style mechanism integrates direct South African bank APIs with a liveness-based release trigger.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <Zap className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Reliability Score Algorithm</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                      A unique multi-factor weighting system calculating trust through GPS punctuality, biometric verification, and peer feedback.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <MapPin className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Safe-Arrival Tracker</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                      Real-time distance/time monitoring system post-trade to ensure users arrive safely at their home coordinates.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <Fingerprint className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Biometric KYC Flow</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                      Original AI-powered identity matching workflow comparing government documents with live facial scans.
                    </p>
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
                    <p className="font-bold text-slate-700">2023/XXXXXX/07 (Pending CIPC Filing)</p>
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

          {/* LIABILITY & WARRANTY */}
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
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-10">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Fingerprint className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[#225BC3]">POPIA Privacy Notice</h3>
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Information Regulator Compliant</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-sm mb-8">
                We collect and process personal information (name, contact, location, biometrics) to operate the marketplace, support transactions, prevent fraud, and comply with legal obligations under the Protection of Personal Information Act.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl text-[10px] font-black text-green-700 uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5"/> Purpose Specification
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl text-[10px] font-black text-green-700 uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5"/> Data Minimisation
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl text-[10px] font-black text-green-700 uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5"/> Security Safeguards
                </div>
              </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
