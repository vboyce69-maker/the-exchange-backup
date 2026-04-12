
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { runAutonomousTesting, AutonomousTesterOutput } from "@/ai/flows/autonomous-tester";
import { antiScamChatProtection } from "@/ai/flows/anti-scam-chat-protection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Terminal,
  Zap,
  Globe,
  Lock,
  Ban,
  Info,
  ChevronRight,
  ShieldAlert,
  Server,
  Cpu,
  Fingerprint
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const SCAM_PHRASES_TO_TEST = [
  "I will send a courier with insurance, pay R500 first",
  "w h a t s a p p me on 0721234567 for faster deals",
  "Proof of payment attached, release the bike now",
  "I accidentally overpaid, send change to my driver",
  "Account blocked! Login here: bit.ly/verify-exchange",
  "Verification code needed: what is your OTP?",
  "wh@tsapp me directly",
  "cl!ck h3re for refund"
];

export default function AutonomousTestCenter() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AutonomousTesterOutput | null>(null);
  const [scamTests, setScamTests] = useState<any[]>([]);

  const runAllTests = async () => {
    setIsRunning(true);
    setScamTests([]);
    setResults(null);
    try {
      const scamResults = await Promise.all(
        SCAM_PHRASES_TO_TEST.map(async (text) => {
          const res = await antiScamChatProtection({ message: text });
          return { text, ...res };
        })
      );
      setScamTests(scamResults);

      const data = await runAutonomousTesting({});
      setResults(data);

      toast({
        title: "Audit Complete",
        description: "Security layers verified successfully.",
      });
    } catch (err: any) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "Audit Alert", 
        description: "Partial diagnostic interruption encountered." 
      });
    } finally {
      setIsRunning(false);
    }
  };

  const isEngineHealthy = scamTests.length > 0 && scamTests.every(t => t.decision === 'block' || t.decision === 'hold' || t.decision === 'warn');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] shadow-xl border border-slate-100 text-center md:text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#225BC3]/10 px-4 py-1.5 rounded-full mb-2">
                 <Fingerprint className="w-3 h-3 text-[#225BC3]" />
                 <span className="text-[9px] lg:text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Trust & Safety Command</span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">Security Protocol</h1>
              <p className="text-muted-foreground font-medium text-xs lg:text-sm">Validating layered defenses and de-obfuscation logic.</p>
            </div>
            <Button 
              className="w-full md:w-auto h-14 lg:h-16 px-10 rounded-2xl bg-[#225BC3] text-white font-black text-base lg:text-lg shadow-2xl hover:scale-105 transition-transform"
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate Full Audit"}
            </Button>
          </div>

          {scamTests.length > 0 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-lg lg:text-xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
                <Ban className="w-6 h-6 text-[#FF8C00]" />
                Phrase Blocking Efficacy
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scamTests.map((test, i) => (
                  <Card key={i} className="rounded-[1.5rem] lg:rounded-3xl border-none shadow-sm bg-white p-5 lg:p-6 space-y-3 ring-1 ring-slate-100">
                    <div className="flex justify-between items-start">
                       <Badge className={cn(
                         "text-[8px] font-black uppercase px-2 py-0.5",
                         test.decision === 'block' ? "bg-red-100 text-red-700" : (test.decision === 'hold' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")
                       )}>
                         {test.decision}
                       </Badge>
                       <span className="font-black text-[#225BC3] text-[10px] lg:text-xs">{test.riskScore} Risk</span>
                    </div>
                    <p className="text-[11px] lg:text-xs font-bold text-slate-800 italic">"{test.text}"</p>
                    <p className="text-[9px] lg:text-[10px] text-slate-500 font-medium leading-relaxed">{test.reason}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-in slide-in-from-bottom-8 duration-700">
              <Card className="lg:col-span-1 rounded-[2rem] lg:rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6">
                <div className="text-center space-y-4">
                   <div className={cn(
                     "w-20 h-20 lg:w-24 lg:h-24 rounded-[1.5rem] lg:rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl",
                     isEngineHealthy ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                   )}>
                     {isEngineHealthy ? <ShieldCheck className="w-10 h-10 lg:w-12 lg:h-12" /> : <AlertTriangle className="w-10 h-10 lg:w-12 lg:h-12" />}
                   </div>
                   <h3 className={cn("text-2xl lg:text-3xl font-black uppercase", isEngineHealthy ? "text-green-600" : "text-orange-600")}>
                     {isEngineHealthy ? "PASS" : "WARN"}
                   </h3>
                   <p className="text-[10px] lg:text-xs font-medium text-slate-500 leading-relaxed px-4">
                     {isEngineHealthy ? "Core security engine is functioning at 100% capacity." : "System requires manual verification of edge-cases."}
                   </p>
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                {results.results.map((res, i) => (
                  <Card key={i} className="rounded-[1.5rem] lg:rounded-[2rem] border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                    <div className="flex flex-col p-5 lg:p-6 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-3 lg:mb-4">
                        <span className="font-black text-slate-900 text-[11px] lg:text-sm uppercase tracking-tight flex items-center gap-2">
                           <Cpu className="w-4 h-4 text-[#225BC3]" />
                           {res.name}
                        </span>
                        <Badge className={cn(
                          "uppercase text-[9px] lg:text-[10px] font-black px-2 lg:px-3 py-1",
                          res.status === 'pass' ? "bg-green-100 text-green-700" : (res.status === 'warning' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")
                        )}>
                          {res.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{res.findings}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
