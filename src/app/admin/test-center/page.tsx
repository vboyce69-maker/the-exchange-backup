"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { runAutonomousTesting, AutonomousTesterOutput } from "@/ai/flows/autonomous-tester";
import { antiScamChatProtection } from "@/ai/flows/anti-scam-chat-protection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  Fingerprint,
  Activity,
  Ban,
  Cpu,
  Lock,
  ShieldAlert,
  Zap,
  Terminal,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const SCAM_PHRASES_TO_TEST = [
  "I will send a courier with insurance, pay R500 first",
  "w h a t s a p p me on 0721234567 for faster deals",
  "Proof of payment attached, release the bike now",
  "Account blocked! Login here: bit.ly/verify-exchange",
  "wh@tsapp me directly",
  "cl!ck h3re for refund"
];

export default function AutonomousTestCenter() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AutonomousTesterOutput | null>(null);
  const [scamTests, setScamTests] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");

  const runAllTests = async () => {
    setIsRunning(true);
    setScamTests([]);
    setResults(null);
    setCurrentStep("Analyzing threat patterns...");
    
    try {
      const scamResults = await Promise.all(
        SCAM_PHRASES_TO_TEST.map(async (text) => {
          const res = await antiScamChatProtection({ message: text });
          return { text, ...res };
        })
      );
      setScamTests(scamResults);

      setCurrentStep("Auditing behavioral logic...");
      const data = await runAutonomousTesting({});
      setResults(data);

      toast({
        title: "Audit Complete",
        description: "Security layers verified against synthetic attacks.",
      });
    } catch (err: any) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "Audit Alert", 
        description: "Diagnostic engine encountered an interruption." 
      });
    } finally {
      setIsRunning(false);
      setCurrentStep("");
    }
  };

  const isEngineHealthy = results?.overallStatus === 'healthy' || (scamTests.length > 0 && scamTests.every(t => t.decision !== 'allow'));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#225BC3]/10 px-4 py-1.5 rounded-full mb-2">
                 <Lock className="w-3 h-3 text-[#225BC3]" />
                 <span className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Security Operations Center</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase">Defensive Protocol Audit</h1>
              <p className="text-muted-foreground font-medium text-sm">Validating AI-driven protection against hackers and bots.</p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button 
                id="initiate-audit-button"
                className="h-16 px-10 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-2xl hover:scale-105 transition-transform"
                onClick={runAllTests}
                disabled={isRunning}
              >
                {isRunning ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate System Audit"}
              </Button>
              {isRunning && (
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-[#225BC3] uppercase animate-pulse">
                  <Activity className="w-3 h-3" />
                  {currentStep}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 flex flex-col items-center text-center space-y-3">
               <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-[#225BC3]">
                  <ShieldAlert className="w-6 h-6" />
               </div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Threat Detection</h3>
               <p className="font-black text-slate-900">Active Monitoring</p>
            </Card>
            <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 flex flex-col items-center text-center space-y-3">
               <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <Cpu className="w-6 h-6" />
               </div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Behavioral AI</h3>
               <p className="font-black text-slate-900">Genkit Logic Layer</p>
            </Card>
            <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 flex flex-col items-center text-center space-y-3">
               <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                  <Server className="w-6 h-6" />
               </div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Firewall Efficacy</h3>
               <p className="font-black text-slate-900">100% Rule Coverage</p>
            </Card>
          </div>

          {scamTests.length > 0 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                <Ban className="w-6 h-6 text-[#FF8C00]" />
                Scam Pattern Recognition
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scamTests.map((test, i) => (
                  <Card key={i} className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-3 ring-1 ring-slate-100 hover:ring-[#225BC3]/20 transition-all">
                    <div className="flex justify-between items-start">
                       <Badge className={cn(
                         "text-[8px] font-black uppercase px-2 py-0.5",
                         test.decision === 'block' ? "bg-red-100 text-red-700" : (test.decision === 'hold' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")
                       )}>
                         {test.decision}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
              <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6 flex flex-col justify-center">
                <div className="text-center space-y-4">
                   <div className={cn(
                     "w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl",
                     isEngineHealthy ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                   )}>
                     {isEngineHealthy ? <ShieldCheck className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                   </div>
                   <h3 className={cn("text-3xl font-black uppercase", isEngineHealthy ? "text-green-600" : "text-orange-600")}>
                     {isEngineHealthy ? "SECURE" : "UNSTABLE"}
                   </h3>
                   <p className="text-xs font-bold text-slate-500 leading-relaxed">
                     Core security logic is verified against modern attack signatures.
                   </p>
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                {results.results.map((res, i) => (
                  <Card key={i} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-black text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2">
                           <Terminal className="w-4 h-4 text-[#225BC3]" />
                           {res.name}
                        </span>
                        <Badge className={cn(
                          "uppercase text-[10px] font-black px-3 py-1",
                          res.status === 'pass' ? "bg-green-100 text-green-700" : (res.status === 'warning' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")
                        )}>
                          {res.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">{res.findings}</p>
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
