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
  Building2,
  Database,
  Activity,
  Cpu,
  Globe
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
              <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">EDR/XDR Framework: AI-DRIVEN THREAT DETECTION</p>
            </div>
            <Button 
              className="bg-[#FF8C00] text-white font-black rounded-2xl h-12 gap-2 shadow-xl hover:scale-105 transition-transform"
              onClick={handleDownloadIP}
            >
              <Download className="w-4 h-4" />
              Download Compliance Portfolio
            </Button>
          </div>

          {/* OFF-PLATFORM LIABILITY */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-red-600 overflow-hidden text-white">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="flex items-center gap-3 uppercase tracking-tighter text-2xl">
                <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
                Off-Platform Activity Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-4">
              <p className="text-lg font-black leading-tight">
                'The Exchange' Marketplace (Pty) Ltd explicitly disclaims all liability for any transaction, agreement, or physical meeting conducted outside of our secure platform.
              </p>
              <p className="text-sm font-bold opacity-90 leading-relaxed">
                By choosing to communicate or pay through external channels (WhatsApp, direct EFT, Cash-on-delivery without escrow), you waive all rights to platform protection. The company is NOT liable for any damages, personal injury, financial loss, or safety issues arising from off-platform meetings. Our "Protected Hold" system is only active for in-app transactions.
              </p>
            </CardContent>
          </Card>

          {/* AI DEFENSE FRAMEWORK */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-[#225BC3] p-10 text-white">
              <CardTitle className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-[#34CBED]" />
                AI Behavioral Defense (Falcon-X Mindset)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#34CBED]" />
                    <h4 className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Real-Time Behavioral Scanning</h4>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Our Genkit-powered AI monitors interaction patterns to detect account takeovers (ATO) and impossible travel anomalies, ensuring your session remains secure from endpoint to cloud.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#FF8C00]" />
                    <h4 className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Proactive Threat Hunting</h4>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Inspired by Aqua Security, we implement automated cloud native security. Every listing is scanned for phishing signatures and metadata manipulation before it goes live.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CYBERSECURITY FRAMEWORK */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50 p-10 border-b">
              <CardTitle className="flex items-center gap-3 text-[#225BC3]">
                <Globe className="w-8 h-8 text-[#34CBED]" />
                Infrastructure Hardening
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-[#225BC3]">
                    <Shield className="w-5 h-5" />
                    <span className="font-black uppercase text-[9px] tracking-widest">Snyk SAST Alignment</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    Codebase and Firestore rules are scanned for configuration vulnerabilities and insecure data patterns.
                  </p>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-[#225BC3]">
                    <Server className="w-5 h-5" />
                    <span className="font-black uppercase text-[9px] tracking-widest">Aqua Native Security</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    Cloud-native container and API security protocols inspired by Forcepoint to prevent backend data exfiltration.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-[#225BC3]">
                    <Lock className="w-5 h-5" />
                    <span className="font-black uppercase text-[9px] tracking-widest">Zero-Trust Access</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    No implicit trust. Every transaction requires multi-factor biometric validation (KYC) before fund release.
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
                Regulatory Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">CPA & POPIA Alignment</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      All AI data processing is conducted within South African borders or in GDPR-compliant zones as per the Protection of Personal Information Act.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-black text-[#225BC3] uppercase text-[10px] tracking-widest mb-1">Security Incident Response</p>
                    <p className="font-bold text-slate-700">threat-intel@theexchange.co.za</p>
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
