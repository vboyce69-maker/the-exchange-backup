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
  Server,
  HeartPulse,
  Eye,
  Gavel,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const SCAM_PHRASES_TO_TEST = [
  "WhatsApp me on 0721234567 for faster deals",
  "Pay R500 insurance fee to release the item",
  "Click here to verify your account: bit.ly/fake-exchange",
  "I'll send a courier with a cheque",
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
    
    try {
      setCurrentStep("Layer 1: Pattern Recognition...");
      const scamResults = await Promise.all(
        SCAM_PHRASES_TO_TEST.map(async (text) => {
          const res = await antiScamChatProtection({ message: text });
          return { text, ...res };
        })
      );
      setScamTests(scamResults);

      setCurrentStep("Layer 2: Logic & Compliance Audit...");
      const data = await runAutonomousTesting({});
      setResults(data);

      toast({
        title: "System Audit Complete",
        description: "All security and logic layers verified.",
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
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-[#225BC3]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#225BC3]/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#225BC3]/10 px-4 py-1.5 rounded-full">
                 <ShieldCheck className="w-3 h-3 text-[#225BC3]" />
                 <span className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Autonomous Testing Agent</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Integrity Audit</h1>
              <p className="text-muted-foreground font-medium text-lg max-w-md">Validating real-time security, legal compliance, and self-healing protocols.</p>
            </div>
            
            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
              <Button 
                className="h-20 px-12 rounded-[2rem] bg-[#225BC3] text-white font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                onClick={runAllTests}
                disabled={isRunning}
              >
                {isRunning ? <Loader2 className="w-8 h-8 animate-spin" /> : "Run Full Audit"}
              </Button>
              {isRunning && (
                <div className="flex items-center justify-center gap-3 text-xs font-black text-[#225BC3] uppercase animate-pulse">
                  <Activity className="w-4 h-4" />
                  {currentStep}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4">
               <div className="p-4 bg-blue-100 rounded-2xl w-fit text-[#225BC3]"><Lock className="w-6 h-6" /></div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Security</h3>
               <p className="text-lg font-black text-slate-900">Pattern Match</p>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4">
               <div className="p-4 bg-orange-100 rounded-2xl w-fit text-[#FF8C00]"><Gavel className="w-6 h-6" /></div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Compliance</h3>
               <p className="text-lg font-black text-slate-900">Legal Logic</p>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4">
               <div className="p-4 bg-green-100 rounded-2xl w-fit text-green-600"><HeartPulse className="w-6 h-6" /></div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Health</h3>
               <p className="text-lg font-black text-slate-900">Self-Healing</p>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4">
               <div className="p-4 bg-purple-100 rounded-2xl w-fit text-purple-600"><Cpu className="w-6 h-6" /></div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">GenAI</h3>
               <p className="text-lg font-black text-slate-900">Prompt Efficacy</p>
            </Card>
          </div>

          {scamTests.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <Ban className="w-8 h-8 text-red-500" />
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Security Layer Validation</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scamTests.map((test, i) => (
                  <Card key={i} className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-3 ring-1 ring-slate-100">
                    <div className="flex justify-between items-center">
                       <Badge className={cn(
                         "text-[8px] font-black uppercase px-2 py-1",
                         test.decision === 'block' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                       )}>
                         {test.decision}
                       </Badge>
                       <span className="text-[10px] font-black text-slate-400">{test.riskScore}% Risk</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 italic leading-snug">"{test.text}"</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{test.reason}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <Server className="w-8 h-8 text-[#225BC3]" />
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Logic & Behavioral Audit</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className={cn(
                  "rounded-[3rem] border-none p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl",
                  isEngineHealthy ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                )}>
                  <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">System {isEngineHealthy ? "Secure" : "Warning"}</h3>
                    <p className="text-sm font-bold opacity-80 mt-2">{results.summary}</p>
                  </div>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                   {results.results.map((res, i) => (
                     <Card key={i} className="rounded-3xl border-none shadow-xl bg-white p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2">
                             <Terminal className="w-4 h-4 text-[#225BC3]" />
                             <span className="font-black text-xs uppercase tracking-widest text-slate-900">{res.name}</span>
                           </div>
                           <Badge className={cn(
                             "text-[9px] font-black px-3 py-1 uppercase",
                             res.status === 'pass' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                           )}>
                             {res.status}
                           </Badge>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{res.findings}</p>
                     </Card>
                   ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
