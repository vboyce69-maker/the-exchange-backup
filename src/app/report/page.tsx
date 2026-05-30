"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShieldAlert, 
  Camera, 
  Loader2, 
  FileText, 
  ChevronRight,
  AlertTriangle,
  Lock,
  Flag,
  X,
  CheckCircle2,
  FileCheck
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useStorage } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ReportPage() {
  return (
    <AuthGuard>
      <ReportContent />
    </AuthGuard>
  );
}

function ReportContent() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reportType, setReportType] = useState<string>("");
  const [listingId, setListingId] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `evidence/${user.uid}/${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setImages(prev => [...prev, downloadURL]);
      toast({ title: "Evidence Secured", description: "Photo linked to report log." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Error", description: "Failed to persist evidence photo." });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !reportType || !description) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "disputes"), {
        reporterId: user.uid,
        listingId: listingId || null,
        type: reportType,
        description,
        evidenceUrls: images,
        status: 'open',
        createdAt: serverTimestamp(),
        severity: 'unclassified'
      });

      toast({ 
        title: "Report Transmitted", 
        description: "Safety team has been notified. We will review your evidence shortly." 
      });
      router.push('/');
    } catch (err) {
      toast({ variant: "destructive", title: "Transmission Fault", description: "Could not send report to security engine." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="max-w-2xl w-full space-y-8">
          
          <div className="text-center space-y-3">
             <div className="w-20 h-20 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-red-100">
                <ShieldAlert className="w-10 h-10 text-red-600" />
             </div>
             <h1 className="text-4xl font-black text-[#225BC3] uppercase tracking-tighter">Security Center</h1>
             <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Incident Reporting & Dispute Hub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
               <CardContent className="p-10 space-y-8">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3] ml-2">Incident Category</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                        <SelectValue placeholder="Select type of report" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scam" className="font-bold">Potential Scam / Fraud</SelectItem>
                        <SelectItem value="counterfeit" className="font-bold">Counterfeit / Fake Item</SelectItem>
                        <SelectItem value="safety" className="font-bold">Safety Concern / Meetup Issue</SelectItem>
                        <SelectItem value="policy" className="font-bold">Policy Violation (Off-platform deal)</SelectItem>
                        <SelectItem value="other" className="font-bold">Other Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3] ml-2">Listing Reference (Optional)</Label>
                    <Input 
                      placeholder="Enter listing ID if known" 
                      className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                      value={listingId}
                      onChange={(e) => setListingId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3] ml-2">Incident Description</Label>
                    <Textarea 
                      placeholder="Describe the issue in detail. Be as specific as possible about usernames or suspicious behavior." 
                      className="min-h-[140px] rounded-2xl bg-slate-50 border-none font-medium resize-none leading-relaxed"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3] ml-2">Evidence Photos ({images.length}/5)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {images.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white">
                          <Image src={url} alt="Evidence" fill className="object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(i)}
                            className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {images.length < 5 && (
                        <button 
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all group"
                        >
                          {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-[#225BC3]" /> : (
                            <>
                              <Camera className="w-6 h-6 text-slate-300 group-hover:text-[#225BC3] transition-colors" />
                              <span className="text-[8px] font-black uppercase text-slate-400">Capture</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      capture="environment"
                      onChange={handleImageCapture}
                    />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Attach screenshots of chats or item defects.</p>
                  </div>
               </CardContent>
            </Card>

            <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 flex gap-4">
               <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Warning</p>
                  <p className="text-[11px] text-red-600 font-bold leading-relaxed">
                    False reports or intentional manipulation of the dispute hub will result in permanent suspension of trading privileges.
                  </p>
               </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-18 bg-[#225BC3] text-white font-black rounded-3xl text-lg shadow-2xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all"
              disabled={isSubmitting || !reportType || !description}
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Transmit Security Report"}
            </Button>
          </form>

          <div className="p-8 text-center opacity-40">
             <div className="flex items-center justify-center gap-3 mb-2">
                <Lock className="w-3 h-3 text-[#225BC3]" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Encrypted Diagnostic Transmission</span>
             </div>
             <p className="text-[8px] text-slate-400 font-medium">Your IP and session context are logged for platform integrity.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
