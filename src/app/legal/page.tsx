
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
  MapPin,
  Shield,
  Server,
  GlobeLock,
  Building2,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LegalHub() {
  const handleDownloadIP = () => {
    toast({
      title: "Security & IP Portfolio Generated",
      description: "Document prepared for CIPC and Compliance auditing.",
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
              <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter uppercase">Compliance & Security Hub</h1>
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Frameworks: OWASP MAS, POPIA, CPA, ECTA</p>
            </div>
            <Button 
              className="bg-[#FF8C00] text-white font-black rounded-2xl h-12 gap-2 shadow-xl hover:scale-105 transition-transform"
              onClick={handleDownloadIP}
            >
              <Download className="w-4 h-4" />
              Download Compliance Portfolio
            </Button>
          </div>

          {/* CORPORATE STRATEGY & COMPLIANCE */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-[#FF8C00] p-10 text-white">
              <CardTitle className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-white" />
                Business Verification Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Pty Ltd Verification</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Inspired by international standards (like Globalfy), we provide professional sellers with a "Verified Pro" status. This requires CIPC registration, VAT certificates, and director biometric binding.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Tax & Trade Compliance</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    We ensure all bulk-lot trades are traceable for SARS reporting, providing a structured environment that protects both the platform and the legitimate trade ecosystem.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CYBERSECURITY FRAMEWORK */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-[#225BC3] p-10 text-white">
              <CardTitle className="flex items-center gap-3">
                <GlobeLock className="w-8 h-8 text-[#34CBED]" />
                Defense-in-Depth Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-[#225BC3]">
                    <Shield className="w-5 h-5" />
                    <span className="font-black uppercase text-[9px] tracking-widest">OWASP MAS Alignment</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    Adherence to Mobile Application Security Verification Standards (MASVS) for data storage, crypto, and network security.
                  </p>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-[#225BC3]">
                    <Server className="w-5 h-5" />
                    <span className="font-black uppercase text-[9px] tracking-widest">Data at Rest (AES-256)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    All PII and transaction records are encrypted using industry-standard AES-256 algorithms on secure cloud infrastructure.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-[#225BC3]">
                    <Lock className="w-5 h-5" />
                    <span className="font-black uppercase text-[9px] tracking-widest">TLS 1.2+ In Transit</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    All communication between your device and our servers is secured via TLS 1.2 or higher to prevent interception.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* INTELLECTUAL PROPERTY */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50 p-8 border-b">
              <CardTitle className="flex items-center gap-3 text-[#225BC3]">
                <Copyright className="w-6 h-6 text-[#34CBED]" />
                Proprietary IP Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-[#225BC3]">
                      <Fingerprint className="w-5 h-5" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Biometric KYC Flow</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                      Original AI-powered identity matching workflow comparing government documents with live facial scans.
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
              </div>
            </CardContent>
          </Card>

          {/* DISCLOSURES */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50 p-8 border-b">
              <CardTitle className="flex items-center gap-3 text-[#225BC3]">
                <Gavel className="w-6 h-6 text-[#34CBED]" />
                ECTA & CPA Disclosures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Company Details</p>
                    <p className="font-bold text-slate-700">The Exchange Marketplace (Pty) Ltd</p>
                    <p className="text-xs text-slate-500">Reg: 2023/XXXXXX/07 (In process)</p>
                  </div>
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">CPA Compliance</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      All sellers are bound by the Consumer Protection Act. We facilitate the platform but do not act as the vendor of goods unless specified.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Data Officer (POPIA)</p>
                    <p className="font-bold text-slate-700">compliance@theexchange.co.za</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
