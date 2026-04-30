"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { runAutonomousTesting, AutonomousTesterOutput } from "@/ai/flows/autonomous-tester";
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
  Gavel,
  FlaskConical,
  Bug,
  ChevronRight,
  ShieldQuestion,
  Wrench,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function AutonomousTestCenter() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AutonomousTesterOutput | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("");

  const runAllTests = async (suiteId?: string) => {
    setIsRunning(true);
    setResults(null);
    setCurrentStep(suiteId ? `Retrying ${suiteId} Suite...` : "Running Autonomous Retry Agent...");
    
    try {
      const data = await runAutonomousTesting({ targetSuiteId: suiteId });
      setResults(data);

      toast({
        title: "Retry Run Complete",
        description: data.overallStatus === 'critical' ? "Critical vulnerabilities detected." : "Platform integrity scan finished.",
      });
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Audit Error", description: "The retry agent encountered a timeout." });
    } finally {
      setIsRunning(false);
      setCurrentStep("");
    }
  };

  const isProductionReady = results ? results.overallStatus === 'healthy' : true;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-10 lg:p-12 rounded-[3.5rem] shadow-2xl border border-[#225BC3]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#225BC3]/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#225BC3]/10 px-4 py-1.5 rounded-full">
                 <RotateCcw className="w-3 h-3 text-[#225BC3]" />
                 <span className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Autonomous QA Retry Agent</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Security Lab</h1>
              <p className="text-muted-foreground font-medium text-lg max-w-md italic">"Re-running failed cases, detecting regressions, and stress-testing core systems."</p>
            </div>
            
            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
              <Button 
                className="h-20 px-12 rounded-[2rem] bg-[#225BC3] text-white font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                onClick={() => runAllTests()}
                disabled={isRunning}
              >
                {isRunning ? <Loader2 className="w-8 h-8 animate-spin" /> : "Run Full Retry Audit"}
              </Button>
              {isRunning && (
                <div className="flex items-center justify-center gap-3 text-xs font-black text-[#225BC3] uppercase animate-pulse">
                  <Activity className="w-4 h-4" />
                  {currentStep}
                </div>
              )}
            </div>
          </div>

          {results && results.overallStatus === 'critical' && (
            <div className="bg-red-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl animate-in zoom-in-95">
               <ShieldAlert className="w-16 h-16 shrink-0 animate-pulse" />
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Deployment Blocked</h2>
                  <p className="font-bold opacity-80">The Retry Agent detected critical bugs or regressions. System is NOT production ready.</p>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4 group hover:ring-2 hover:ring-[#225BC3]/5 transition-all cursor-pointer" onClick={() => runAllTests("KYC")}>
               <div className="p-4 bg-blue-100 rounded-2xl w-fit text-[#225BC3]"><Fingerprint className="w-6 h-6" /></div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">KYC Onboarding</h3>
               <p className="text-lg font-black text-slate-900">Race Conditions</p>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4 group hover:ring-2 hover:ring-[#225BC3]/5 transition-all cursor-pointer" onClick={() => runAllTests("Scam")}>
               <div className="p-4 bg-orange-100 rounded-2xl w-fit text-[#FF8C00]"><Ban className="w-6 h-6" /></div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Scam Evasion</h3>
               <p className="text-lg font-black text-slate-900">Leetspeak & Unicode</p>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4 group hover:ring-2 hover:ring-[#225BC3]/5 transition-all cursor-pointer" onClick={() => runAllTests("Location")}>
               <div className="p-4 bg-green-100 rounded-2xl w-fit text-green-600"><Gavel className="w-6 h-6" /></div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Meetup Points</h3>
               <p className="text-lg font-black text-slate-900">GPS Drift & Spoof</p>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4 group hover:ring-2 hover:ring-[#225BC3]/5 transition-all cursor-pointer" onClick={() => runAllTests("Crash")}>
               <div className="p-4 bg-red-100 rounded-2xl w-fit text-red-600"><Bug className="w-6 h-6" /></div>
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Crash & Load</h3>
               <p className="text-lg font-black text-slate-900">1,500 Users Simulation</p>
            </Card>
          </div>

          {results && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                 <Terminal className="w-8 h-8 text-[#225BC3]" />
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Structured Audit Findings</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {results.reports.map((report, i) => (
                  <Card key={i} className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100 flex flex-col">
                     <div className={cn(
                       "p-8 flex items-center justify-between",
                       report.crash_risk_level === 'HIGH' ? "bg-red-600 text-white" : "bg-slate-50 text-slate-900"
                     )}>
                        <div className="space-y-1">
                           <h3 className="text-2xl font-black uppercase tracking-tighter">{report.suite}</h3>
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                             {report.passed}/{report.total_tests} Tests Passed • {report.retry_run ? "Retry Run" : "First Run"}
                           </p>
                        </div>
                        <Badge className={cn(
                          "px-4 py-1.5 rounded-full font-black text-[10px] uppercase border-none shadow-lg",
                          report.crash_risk_level === 'HIGH' ? "bg-white text-red-600 animate-pulse" : 
                          report.crash_risk_level === 'MEDIUM' ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                        )}>
                          Risk: {report.crash_risk_level}
                        </Badge>
                     </div>

                     <div className="p-8 space-y-6 flex-1">
                        {report.regressions_detected.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-orange-600">
                                <RotateCcw className="w-4 h-4" />
                                <span className="font-black uppercase text-[10px] tracking-widest">Regressions Detected</span>
                             </div>
                             {report.regressions_detected.map((bug, bi) => (
                               <div key={bi} className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 text-xs font-bold">
                                 ⚠️ {bug}
                               </div>
                             ))}
                          </div>
                        )}

                        {report.critical_bugs.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-red-600">
                                <Bug className="w-4 h-4" />
                                <span className="font-black uppercase text-[10px] tracking-widest">Critical Vulnerabilities</span>
                             </div>
                             {report.critical_bugs.map((bug, bi) => (
                               <div key={bi} className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-800 text-xs font-bold leading-relaxed">
                                 🚨 {bug}
                               </div>
                             ))}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Non-Deterministic</p>
                              <p className="text-xl font-black text-[#225BC3]">{report.non_deterministic_failures}</p>
                           </div>
                           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Warnings</p>
                              <p className="text-xl font-black text-orange-500">{report.warnings}</p>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-[#225BC3]">
                              <Wrench className="w-4 h-4" />
                              <span className="font-black uppercase text-[10px] tracking-widest">Recommended Fixes</span>
                           </div>
                           <div className="space-y-2">
                             {report.recommended_fixes.map((fix, fi) => (
                               <div key={fi} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                  <div className="w-1.5 h-1.5 bg-[#225BC3] rounded-full mt-1.5 shrink-0" />
                                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{fix}</p>
                               </div>
                             ))}
                           </div>
                        </div>
                     </div>
                  </Card>
                ))}
              </div>

              <Card className="rounded-[3rem] border-none shadow-xl bg-[#225BC3] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Executive Summary</h3>
                   <p className="text-xl font-bold text-white/80 max-w-3xl leading-relaxed italic">"{results.summary}"</p>
                </div>
              </Card>
            </div>
          )}

          {!results && !isRunning && (
            <div className="text-center py-24 bg-white rounded-[4rem] shadow-sm border-2 border-dashed border-slate-100">
               <ShieldQuestion className="w-20 h-20 text-slate-100 mx-auto mb-6" />
               <p className="font-black text-[#225BC3] uppercase tracking-widest text-lg">Select a Module to Audit</p>
               <p className="text-muted-foreground text-sm font-medium mt-2">Run the Retry Agent to validate fixes and detect regressions.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
