"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, 
  ShieldCheck, 
  CreditCard, 
  Scale, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  ArrowRight,
  Server,
  Lock,
  Smartphone,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReadinessDashboard() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const readinessItems = [
    { category: "Security", label: "Biometric KYC Flow", status: "ready", icon: ShieldCheck, href: "/verify" },
    { category: "Security", label: "Firestore Permission Rules", status: "ready", icon: Lock, href: "/legal" },
    { category: "Market", label: "Auction Engine Logic", status: "ready", icon: Rocket, href: "/auctions" },
    { category: "Market", label: "Real Payment Gateway", status: "pending", icon: CreditCard, href: "/verify" },
    { category: "Legal", label: "POPIA Data Policy", status: "ready", icon: Scale, href: "/legal" },
    { category: "Legal", label: "T&Cs Final Review", status: "pending", icon: AlertCircle, href: "/legal" },
    { category: "Platform", label: "PWA Mobile Installation", status: "ready", icon: Smartphone, href: "/" },
    { category: "Platform", label: "Custom Domain Sync", status: "pending", icon: Globe, href: "/settings" },
  ];

  const readyCount = readinessItems.filter(i => i.status === "ready").length;
  const score = Math.round((readyCount / readinessItems.length) * 100);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#225BC3]/10 text-[#225BC3] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Rocket className="w-3 h-3" /> Pre-Launch Command
            </div>
            <h1 className="text-5xl font-black text-[#225BC3] uppercase tracking-tighter">
              Launch Readiness
            </h1>
            <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
              Assessment of 'The Exchange' infrastructure against production-grade South African marketplace requirements.
            </p>
          </div>

          <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#225BC3]/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Overall Readiness Score
                  </p>
                  <div className="flex items-baseline gap-3 justify-center md:justify-start">
                    <span className="text-7xl font-black text-[#225BC3] tracking-tighter">
                      {score}%
                    </span>
                    <Badge className="bg-green-100 text-green-700 font-black uppercase text-[10px] border-none px-3">
                      High Confidence
                    </Badge>
                  </div>
                </div>
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Target: 100%</span>
                    <span>{readyCount}/{readinessItems.length} Pillars</span>
                  </div>
                  <Progress value={score} className="h-3 bg-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readinessItems.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "p-6 rounded-[2rem] border transition-all flex items-center justify-between group cursor-pointer",
                      item.status === "ready" 
                        ? "bg-green-50 border-green-100 hover:bg-green-100" 
                        : "bg-white border-slate-100 hover:border-[#225BC3]/20 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                        item.status === "ready" ? "bg-white text-green-600" : "bg-slate-50 text-slate-400"
                      )}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
                          {item.category}
                        </p>
                        <h4 className="font-black text-sm text-slate-900 uppercase">
                          {item.label}
                        </h4>
                      </div>
                    </div>
                    {item.status === "ready" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 text-slate-400 group-hover:text-[#225BC3] group-hover:border-[#225BC3]/20">
                        Input Required
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-md leading-relaxed">
                  "All critical safety pillars are online. The remaining tasks are primarily external integration and documentation finalization."
                </p>
                <div className="flex gap-4">
                  <Button 
                    className="h-14 px-10 rounded-2xl bg-[#225BC3] text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('/docs/PUBLISH_READINESS.md', '_blank');
                    }}
                  >
                    View Technical Roadmap <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="text-center pb-12 opacity-30">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
              The Exchange Deployment Audit Suite &copy; 2026
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
