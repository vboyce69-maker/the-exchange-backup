'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { resolveSystemError, ErrorResolverOutput } from '@/ai/flows/error-resolver-flow';
import { 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Server, 
  RefreshCw,
  Zap,
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function SystemHealthPage() {
  const db = useFirestore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const errorsQuery = useMemoFirebase(() => {
    return query(collection(db, 'systemErrors'), orderBy('timestamp', 'desc'), limit(10));
  }, [db]);

  const { data: errors, isLoading } = useCollection(errorsQuery);

  const handleAnalyzeError = async (error: any) => {
    setAnalyzingId(error.id);
    try {
      const resolution = await resolveSystemError({
        errorMessage: error.message,
        stackTrace: error.stack,
        componentStack: error.componentStack
      });

      const errorRef = doc(db, 'systemErrors', error.id);
      await updateDoc(errorRef, {
        aiResolution: resolution,
        status: 'analyzed',
        severity: resolution.severity
      });

      toast({
        title: "Analysis Complete",
        description: "AI has generated a suggested resolution for this crash.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "AI Analysis Failed", description: "Could not reach resolution engine." });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    const errorRef = doc(db, 'systemErrors', id);
    await updateDoc(errorRef, { status: 'resolved', resolved: true });
    toast({ title: "Status Updated", description: "Error marked as resolved." });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter uppercase">System Integrity</h1>
              <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-[#34CBED]" /> Real-time Diagnostics & AI Correction
              </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Core Services: Online</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-blue-100 rounded-2xl text-[#225BC3]">
                    <Database className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Database</h3>
                    <p className="text-lg font-black text-slate-900">Firestore Reactive</p>
                 </div>
              </div>
            </Card>
            <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                    <Cpu className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">AI Logic</h3>
                    <p className="text-lg font-black text-slate-900">Genkit 1.x Active</p>
                 </div>
              </div>
            </Card>
            <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                    <Lock className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Security</h3>
                    <p className="text-lg font-black text-slate-900">Protected Mode</p>
                 </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Recent Stability Logs</h2>
               <Button variant="ghost" className="rounded-xl font-bold text-[#225BC3]" onClick={() => window.location.reload()}>
                 <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} /> Refresh Feed
               </Button>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="py-20 text-center"><RefreshCw className="w-10 h-10 animate-spin text-slate-200 mx-auto" /></div>
              ) : errors && errors.length > 0 ? (
                errors.map((error) => (
                  <Card key={error.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
                    <div className="p-8 flex flex-col lg:flex-row gap-8">
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                             <Badge className={cn(
                               "uppercase text-[9px] font-black px-3 py-1",
                               error.status === 'resolved' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                             )}>
                               {error.status}
                             </Badge>
                             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                               <Clock className="w-3 h-3" /> {new Date(error.timestamp).toLocaleString()}
                             </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 leading-tight">"{error.message}"</h3>
                          <div className="p-4 bg-slate-50 rounded-2xl font-mono text-[10px] text-slate-500 overflow-x-auto">
                            {error.stack?.split('\n').slice(0, 3).join('\n')}...
                          </div>
                          <div className="flex gap-3">
                            {error.status !== 'resolved' && (
                              <Button 
                                size="sm" 
                                className="bg-[#225BC3] text-white font-black rounded-xl"
                                onClick={() => handleAnalyzeError(error)}
                                disabled={analyzingId === error.id}
                              >
                                {analyzingId === error.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                                AI Resolve
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="rounded-xl font-black" onClick={() => handleResolve(error.id)}>
                               Mark Fixed
                            </Button>
                          </div>
                       </div>

                       {error.aiResolution && (
                         <div className="lg:w-1/3 bg-[#225BC3]/5 p-6 rounded-3xl border border-[#225BC3]/10 space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-2 text-[#225BC3]">
                               <Wrench className="w-4 h-4" />
                               <span className="font-black uppercase text-[10px] tracking-widest">AI Suggested Fix</span>
                            </div>
                            <div className="space-y-3">
                               <p className="text-[11px] font-bold text-slate-700">{error.aiResolution.explanation}</p>
                               <div className="p-3 bg-white rounded-xl border border-[#225BC3]/20 font-mono text-[9px] text-[#225BC3]">
                                 {error.aiResolution.suggestedFix}
                               </div>
                            </div>
                         </div>
                       )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-slate-100">
                   <ShieldCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                   <p className="font-black text-[#225BC3] uppercase tracking-widest">No Crashes Detected</p>
                   <p className="text-muted-foreground text-sm font-medium">Application integrity is currently optimal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
