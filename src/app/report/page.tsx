"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  FileCheck,
  History,
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
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { cn } from "@/lib/utils";

function ReportPageInner() {
  return (
    <AuthGuard>
      <ReportContent />
    </AuthGuard>
  );
}

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [reportType, setReportType] = useState<string>("");
  const [listingId, setListingId] = useState(
    searchParams.get("listingId") || "",
  );
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidTradeWindow, setIsValidTradeWindow] = useState(true);

  useEffect(() => {
    async function checkTradeWindow() {
      if (!db || !listingId || !user) return;
      const lDoc = await getDoc(doc(db, "publicListings", listingId));
      if (lDoc.exists()) {
        const data = lDoc.data();
        if (data.status === "sold" && data.soldAt) {
          const soldDate = new Date(data.soldAt).getTime();
          const diff = Date.now() - soldDate;
          // Enforcement: 24h dispute window
          if (diff > 86400000) {
            setIsValidTradeWindow(false);
          }
        }
      }
    }
    checkTradeWindow();
  }, [db, listingId, user]);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUri = event.target?.result as string;
        const storageRef = ref(
          storage,
          `evidence/${user.uid}/${Date.now()}.jpg`,
        );
        await uploadString(storageRef, dataUri, "data_url");
        const url = await getDownloadURL(storageRef);
        setImages((prev) => [...prev, url]);
        toast({
          title: "Evidence Secured",
          description: "Photo encrypted and linked to report log.",
        });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Persistence Error",
        description: "Failed to upload evidence photo.",
      });
    } finally {
      setIsUploading(false);
    }
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
        status: "open",
        requestRefund: reportType === "scam" || reportType === "safety",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Dispute Initialized",
        description:
          "Safety team has been notified. Protected Hold is being analyzed.",
      });
      router.push("/");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Transmission Fault",
        description: "Security engine sync failed.",
      });
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
            <h1 className="text-4xl font-black text-[#225BC3] uppercase tracking-tighter">
              Safety Center
            </h1>
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
              Dispute Initiation Hub
            </p>
          </div>

          {!isValidTradeWindow && (
            <div className="p-6 bg-orange-50 border border-orange-200 rounded-3xl flex gap-4">
              <History className="w-6 h-6 text-orange-600 shrink-0" />
              <p className="text-xs font-bold text-orange-800 leading-relaxed uppercase">
                Dispute window expired. Reports for completed trades must be
                filed within 24 hours of safe zone arrival.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
              <CardContent className="p-10 space-y-8">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                    Incident Category
                  </Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scam" className="font-bold">
                        Scam Attempt (Request Refund)
                      </SelectItem>
                      <SelectItem value="safety" className="font-bold">
                        Safety Incident (Safe Zone)
                      </SelectItem>
                      <SelectItem value="defect" className="font-bold">
                        Item Defect / Not as Described
                      </SelectItem>
                      <SelectItem value="policy" className="font-bold">
                        Policy Violation (Off-platform)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                    Listing ID
                  </Label>
                  <Input
                    placeholder="Enter listing ref if applicable"
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                    value={listingId}
                    onChange={(e) => setListingId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                    Incident Logs
                  </Label>
                  <Textarea
                    placeholder="Details of the interaction..."
                    className="min-h-[140px] rounded-2xl bg-slate-50 border-none font-medium leading-relaxed"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                    Evidence Storage ({images.length}/5)
                  </Label>
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-2xl overflow-hidden shadow-md"
                      >
                        <Image
                          src={url}
                          alt="Evidence"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center"
                      >
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleCapture}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-18 bg-[#225BC3] text-white font-black rounded-3xl text-lg shadow-2xl disabled:opacity-50"
              disabled={isSubmitting || !reportType || !isValidTradeWindow}
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Transmit Safety Report"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ReportPage() {
  return <Suspense fallback={<div>Loading...</div>}><ReportPageInner /></Suspense>;
}
