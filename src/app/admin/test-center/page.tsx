"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { runAutonomousTesting, AutonomousTesterOutput } from "@/ai/flows/autonomous-tester";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
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
  Bug,
  ChevronRight,
  ShieldQuestion,
  Wrench,
  RotateCcw,
  AlertCircle,
  Database,
  Wifi,
  MonitorSmartphone,
  Flame,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AutonomousTestCenter() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AutonomousTesterOutput | null>(null);
  const [intensity, setIntensity] = useState<'NORMAL' | 'HIGH' | 'EXTREME'>('NORMAL');

  const runAllTests = async (suiteId?: string) => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const data = await runAutonomousTesting({ 
        targetSuiteId: suiteId,
        intensity: intensity
      });
      setResults(data);

      toast({
        title: "Audit Complete",
        description: data.overallStatus === 'critical' ? "CRITICAL vulnerabilities exposed." : "System limits verified.",
      });
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Audit Error", description: "The agent encountered a system timeout." });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-8 lg:py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Compact Header */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-[#225BC3] p-8 lg:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#34CBED]/10 rounded-full blur-[80px] -ml-24 -mb-24" />
            
            <div className="relative z-10 space-y-4 text-center lg:text-left flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                 <Cpu className="w-3 h-3 text-[#34CBED]" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Elite QA Stress Agent v2.5</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none">Security Lab</h1>
              <p className="text-white/80 font-bold text-sm max-w-lg leading-relaxed italic">
                "Breaking the platform to build a fortress. Stress testing 100k concurrent users and adversarial security flows."
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {['NORMAL', 'HIGH', 'EXTREME'].map((lvl) => (
                  <button 
                    key={lvl}
                    onClick={() => setIntensity(lvl as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      intensity === lvl ? "bg-white text-[#225BC3] shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    {lvl === 'EXTREME' && <Flame className="w-2.5 h-2.5 mr-1 inline-block animate-pulse" />}
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto shrink-0">
              <Button 
                className={cn(
                  "h-16 px-10 rounded-2xl font-black text-lg shadow-xl transition-all border-2",
                  intensity === 'EXTREME' ? "bg-red-600 border-red-400 hover:bg-red-700" : "bg-white text-[#225BC3] border-white/20"
                )}
                onClick={() => runAllTests()}
                disabled={isRunning}
              >
                {isRunning ? <Loader2 className="w-8 h-8 animate-spin" /> : "Run Full Audit"}
              </Button>
              {isRunning && (
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase animate-pulse">
                  <Activity className="w-3.5 h-3.5" />
                  Simulating Load...
                </div>
              )}
            </div>
          </div>

          {results && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 flex flex-col items-center text-center gap-4">
                 <div className="p-5 bg-blue-50 rounded-[2rem] text-[#225BC3]"><Activity className="w-8 h-8" /></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scalability Rating</p>
                    <p className="text-4xl font-black text-slate-900">{results.scalabilityRating}/10</p>
                 </div>
              </Card>
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 flex flex-col items-center text-center gap-4">
                 <div className="p-5 bg-orange-50 rounded-[2rem] text-[#FF8C00]"><ShieldAlert className="w-8 h-8" /></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className={cn("text-4xl font-black uppercase", results.overallStatus === 'healthy' ? "text-green-600" : "text-red-600")}>
                      {results.overallStatus}
                    </p>
                 </div>
              </Card>
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 flex flex-col items-center text-center gap-4">
                 <div className="p-5 bg-red-50 rounded-[2rem] text-red-600"><Bug className="w-8 h-8" /></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Weakness</p>
                    <p className="text-xl font-black text-slate-900 truncate max-w-[200px]">{results.mostUnstableFeature}</p>
                 </div>
              </Card>
            </div>
          )}

          {results && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Terminal className="w-8 h-8 text-[#225BC3]" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Structured Audit Findings</h2>
                 </div>
                 <Badge variant="outline" className="font-black text-[10px] px-4 py-1.5 rounded-full border-slate-200">
                    Audit Date: {new Date(results.auditTimestamp).toLocaleString()}
                 </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {results.reports.map((report, i) => (
                  <Card key={i} className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
                     <div className={cn(
                       "p-8 flex items-center justify-between",
                       report.crash_risk_level === 'CRITICAL' || report.crash_risk_level === 'HIGH' ? "bg-red-600 text-white" : "bg-slate-50 text-slate-900"
                     )}>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             {report.category === 'SECURITY' && <Lock className="w-4 h-4" />}
                             {report.category === 'STRESS' && <Activity className="w-4 h-4" />}
                             {report.category === 'NETWORK' && <Wifi className="w-4 h-4" />}
                             <h3 className="text-2xl font-black uppercase tracking-tighter">{report.suite}</h3>
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                             {report.passed}/{report.total_tests} Tests Passed • {report.category}
                           </p>
                        </div>
                        <Badge className={cn(
                          "px-4 py-1.5 rounded-full font-black text-[10px] uppercase border-none shadow-lg",
                          report.crash_risk_level === 'CRITICAL' ? "bg-white text-red-600 animate-pulse" : 
                          report.crash_risk_level === 'HIGH' ? "bg-white text-red-600" :
                          report.crash_risk_level === 'MEDIUM' ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                        )}>
                          Risk: {report.crash_risk_level}
                        </Badge>
                     </div>

                     <div className="p-8 space-y-6">
                        {report.performance && (
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                 <p className="text-[8px] font-black text-slate-400 uppercase">Avg Response</p>
                                 <p className="text-xl font-black text-[#225BC3]">{report.performance.avgResponseTimeMs}ms</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                 <p className="text-[8px] font-black text-slate-400 uppercase">Peak Latency</p>
                                 <p className="text-xl font-black text-[#FF8C00]">{report.performance.peakLatencyMs}ms</p>
                              </div>
                           </div>
                        )}

                        {report.critical_bugs.length > 0 && (
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-red-600">
                                <Bug className="w-4 h-4" />
                                <span className="font-black uppercase text-[10px] tracking-widest">Adversarial Failures</span>
                             </div>
                             {report.critical_bugs.map((bug, bi) => (
                               <div key={bi} className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-800 text-xs font-bold leading-relaxed">
                                 🚨 {bug}
                               </div>
                             ))}
                          </div>
                        )}

                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-[#225BC3]">
                              <Wrench className="w-4 h-4" />
                              <span className="font-black uppercase text-[10px] tracking-widest">Fix Strategy</span>
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

              <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white p-12 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><Database className="w-32 h-32" /></div>
                 <div className="relative z-10 space-y-6">
                    <h3 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Executive Audit Summary</h3>
                    <p className="text-xl font-bold text-slate-700 max-w-4xl leading-relaxed italic border-l-8 border-[#225BC3] pl-8">
                       "{results.executiveSummary}"
                    </p>
                    <div className="flex flex-wrap gap-3">
                       {results.topFailurePoints.map((point, pi) => (
                         <Badge key={pi} className="bg-red-100 text-red-700 border-none px-4 py-1 font-black text-[10px] uppercase">{point}</Badge>
                       ))}
                    </div>
                 </div>
              </Card>
            </div>
          )}

          {!results && !isRunning && (
            <div className="text-center py-32 bg-white rounded-[4rem] shadow-sm border-2 border-dashed border-slate-100">
               <ShieldQuestion className="w-20 h-20 text-slate-100 mx-auto mb-6" />
               <p className="font-black text-[#225BC3] uppercase tracking-widest text-lg">Initialize Security Hub</p>
               <p className="text-muted-foreground text-sm font-medium mt-2">Select an intensity level and run the full suite audit.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
