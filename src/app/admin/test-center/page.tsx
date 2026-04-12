
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { runAutonomousTesting, AutonomousTesterOutput } from "@/ai/flows/autonomous-tester";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Terminal,
  Activity,
  Zap,
  History,
  Bug,
  Globe,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function AutonomousTestCenter() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AutonomousTesterOutput | null>(null);

  const startTest = async () => {
    setIsRunning(true);
    try {
      const data = await runAutonomousTesting({});
      setResults(data);
      toast({
        title: "AI Audit Complete",
        description: `Marketplace Health: ${data.overallStatus.toUpperCase()}`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Test Failed", description: "The AI agent encountered a system error." });
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
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#225BC3]/10 px-4 py-1.5 rounded-full mb-2">
                 <Zap className="w-3 h-3 text-[#225BC3] fill-current" />
                 <span className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Autonomous QA Agent</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Test Command Center</h1>
              <p className="text-muted-foreground font-medium text-sm">Simulate 'The Mobile App Testing Process' (Testlio/Digital.ai) using generative AI.</p>
            </div>
            <Button 
              className="h-16 px-10 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-2xl hover:scale-105 transition-transform"
              onClick={startTest}
              disabled={isRunning}
            >
              {isRunning ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Play className="w-5 h-5 mr-2" /> Run AI Audit</>}
            </Button>
          </div>

          {results && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6">
                <div className="text-center space-y-4">
                   <div className={cn(
                     "w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl",
                     results.overallStatus === 'healthy' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                   )}>
                     {results.overallStatus === 'healthy' ? <ShieldCheck className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Health</p>
                     <h3 className={cn("text-3xl font-black uppercase", results.overallStatus === 'healthy' ? "text-green-600" : "text-orange-600")}>
                       {results.overallStatus}
                     </h3>
                   </div>
                </div>
                
                <div className="space-y-4 pt-6 border-t">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">AI Executive Summary</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                    "{results.summary}"
                  </p>
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-[#225BC3]" />
                  Execution Logs
                </h2>
                
                {results.results.map((res, i) => (
                  <Card key={i} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                    <div className="flex items-center justify-between p-6 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        {res.status === 'pass' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                        <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{res.name}</span>
                      </div>
                      <Badge className={cn("border-none text-[8px] font-black uppercase", res.status === 'pass' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
                        {res.status}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{res.findings}</p>
                      {res.anomalies && res.anomalies.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                            <Bug className="w-3 h-3" /> Anomalies Detected
                          </p>
                          <ul className="grid grid-cols-1 gap-1">
                            {res.anomalies.map((a, j) => (
                              <li key={j} className="text-[10px] font-bold text-slate-400 bg-red-50 px-3 py-1 rounded-lg border border-red-100">{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!results && !isRunning && (
            <div className="text-center py-24 opacity-40">
               <Activity className="w-16 h-16 mx-auto text-slate-300 mb-4" />
               <p className="font-black uppercase text-[10px] tracking-widest">Awaiting Command... System Idle</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Meta */}
      <div className="fixed bottom-8 right-8 flex gap-4 pointer-events-none opacity-20">
         <div className="flex items-center gap-1 text-[8px] font-black uppercase"><Globe className="w-3 h-3" /> Globalfy AI-Ready</div>
         <div className="flex items-center gap-1 text-[8px] font-black uppercase"><Lock className="w-3 h-3" /> E2E Sandbox</div>
      </div>
    </div>
  );
}
