
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  Loader2, 
  AlertTriangle,
  User,
  Clock,
  ExternalLink,
  Ban
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ModerationPage() {
  const db = useFirestore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const moderationQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "moderationQueue"), orderBy("timestamp", "desc"));
  }, [db]);

  const { data: records, isLoading } = useCollection(moderationQuery);

  const handleAction = async (id: string, action: 'resolve' | 'dismiss' | 'block') => {
    if (!db) return;
    setProcessingId(id);
    try {
      const ref = doc(db, "moderationQueue", id);
      if (action === 'dismiss') {
        await deleteDoc(ref);
        toast({ title: "Record Dismissed", description: "The report has been cleared from the queue." });
      } else {
        await updateDoc(ref, { status: action === 'resolve' ? 'resolved' : 'blocked' });
        toast({ title: `Record ${action}d`, description: "The moderation status has been updated." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update record." });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-[#225BC3] uppercase tracking-tighter">Security Command</h1>
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-red-500" /> Human Review Queue (Falcon Engine)
              </p>
            </div>
            <Badge variant="outline" className="h-10 px-6 rounded-2xl font-black text-slate-400 border-slate-200 uppercase tracking-widest">
              {records?.length || 0} Pending Flags
            </Badge>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" /></div>
            ) : records && records.length > 0 ? (
              records.map((record) => (
                <Card key={record.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
                  <div className="p-8 flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Badge className={cn(
                             "uppercase text-[9px] font-black px-3 py-1 border-none",
                             record.decision === 'block' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                           )}>
                             {record.decision}
                           </Badge>
                           <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {new Date(record.timestamp).toLocaleString()}
                           </span>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                         <p className="text-sm font-bold text-slate-900 leading-relaxed italic">"{record.content}"</p>
                         <p className="text-[10px] text-slate-500 font-medium">Reason: {record.reason}</p>
                      </div>

                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-900 uppercase">User: {record.userId.substring(0, 8)}...</span>
                         </div>
                         <Button variant="link" className="h-auto p-0 font-black text-[#225BC3] text-[10px] uppercase tracking-widest">
                            View Profile <ExternalLink className="w-3 h-3 ml-1" />
                         </Button>
                      </div>
                    </div>

                    <div className="lg:w-1/4 flex flex-col gap-3 justify-center">
                       <Button 
                        className="bg-green-600 text-white font-black rounded-2xl h-12"
                        onClick={() => handleAction(record.id, 'resolve')}
                        disabled={processingId === record.id}
                       >
                         {processingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} Allow Content
                       </Button>
                       <Button 
                        variant="outline"
                        className="rounded-2xl h-12 font-black text-red-600 border-red-100 hover:bg-red-50"
                        onClick={() => handleAction(record.id, 'block')}
                        disabled={processingId === record.id}
                       >
                         <Ban className="w-4 h-4 mr-2" /> Permanent Block
                       </Button>
                       <Button 
                        variant="ghost"
                        className="rounded-2xl h-12 font-black text-slate-400"
                        onClick={() => handleAction(record.id, 'dismiss')}
                        disabled={processingId === record.id}
                       >
                         Dismiss Flag
                       </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-32 bg-white rounded-[4rem] shadow-sm border-2 border-dashed border-slate-100">
                 <CheckCircle2 className="w-16 h-16 text-green-100 mx-auto mb-4" />
                 <p className="font-black text-[#225BC3] uppercase tracking-widest">Registry Clear</p>
                 <p className="text-muted-foreground text-sm font-medium">No pending moderation tasks detected.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
