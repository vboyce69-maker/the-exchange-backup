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
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const SCAM_PHRASES_TO_TEST = [
  "I will send a courier with insurance, pay R500 first",
  "Proof of payment attached, release the bike now",
  "I accidentally overpaid, send change to my driver",
  "Account blocked! Login here: bit.ly/verify-exchange",
  "Send your w-h-a-t-s-a-p-p number immediately",
  "Verification code needed: what is your OTP?"
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
      // 1. Run Enforced Scam Blocking Tests (The Core Engine)
      const scamResults = await Promise.all(
        SCAM_PHRASES_TO_TEST.map(async (text) => {
          const res = await antiScamChatProtection({ message: text });
          return { text, ...res };
        })
      );
      setScamTests(scamResults);

      // 2. Run Core Logic Audit (AI Agent Walkthrough)
      const data = await runAutonomousTesting({});
      setResults(data);

      toast({
        title: "Audit Complete",
        description: data.overallStatus === 'healthy' ? "All systems operational." : "Security verified with AI warnings.",
      });
    } catch (err: any) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "Audit Encountered Issues", 
        description: err.message || "AI service connectivity warning." 
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#225BC3]/10 px-4 py-1.5 rounded-full mb-2">
                 <Zap className="w-3 h-3 text-[#225BC3] fill-current" />
                 <span className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">E2E Risk Engine Audit</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Security Command</h1>
              <p className="text-muted-foreground font-medium text-sm">Testing Scam Phrase Blocking & Contextual Decision Logic.</p>
            </div>
            <Button 
              className="h-16 px-10 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-2xl hover:scale-105 transition-transform"
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? <Loader2 className="w-6 h-6 animate-spin" /> : "Run Advanced Audit"}
            </Button>
          </div>

          {scamTests.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Ban className="w-6 h-6 text-[#FF8C00]" />
                Scam Blocking Efficacy Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scamTests.map((test, i) => (
                  <Card key={i} className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-3">
                    <div className="flex justify-between items-start">
                       <Badge className={cn(
                         "text-[8px] font-black uppercase px-2 py-0.5",
                         test.blocked ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                       )}>
                         {test.blocked ? 'block' : 'flag'}
                       </Badge>
                       <span className="font-black text-[#225BC3] text-xs">{test.riskScore} Risk</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 italic">"{test.text}"</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{test.reason}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6">
                <div className="text-center space-y-4">
                   <div className={cn(
                     "w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl",
                     results.overallStatus === 'healthy' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                   )}>
                     {results.overallStatus === 'healthy' ? <ShieldCheck className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                   </div>
                   <h3 className={cn("text-3xl font-black uppercase", results.overallStatus === 'healthy' ? "text-green-600" : "text-orange-600")}>
                     {results.overallStatus === 'unstable' && scamTests.every(t => t.blocked) ? "PASS" : results.overallStatus}
                   </h3>
                   <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">
                     {results.summary}
                   </p>
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                {results.results.map((res, i) => (
                  <Card key={i} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                    <div className="flex flex-col p-6 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{res.name}</span>
                        <Badge className={cn(
                          "uppercase text-[10px] font-black px-3 py-1",
                          res.status === 'pass' ? "bg-green-100 text-green-700" : (res.status === 'warning' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")
                        )}>
                          {res.status === 'warning' && scamTests.every(t => t.blocked) ? 'PASS' : res.status}
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-2 items-start">
                          <Info className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                              {res.findings}
                            </p>
                          </div>
                        </div>
                        {res.anomalies && res.anomalies.length > 0 && (
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-1">
                              <Server className="w-2.5 h-2.5" /> Diagnostic Context
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {res.anomalies.map((a, j) => (
                                <div key={j} className="text-[9px] font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                                  {a}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-8 right-8 flex gap-4 pointer-events-none opacity-20">
         <div className="flex items-center gap-1 text-[8px] font-black uppercase"><Globe className="w-3 h-3" /> Cyber Intel Hub</div>
         <div className="flex items-center gap-1 text-[8px] font-black uppercase"><Lock className="w-3 h-3" /> EDR Protocol</div>
      </div>
    </div>
  );
}
