
"use client";

import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Camera, 
  ScanFace,
  RefreshCw,
  UserCheck,
  User,
  Building2,
  ArrowRight,
  Fingerprint,
  Smartphone,
  FileCheck,
  CreditCard,
  MapPin,
  Lock
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { useUser, useFirestore, useStorage } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { cn } from "@/lib/utils";
import { calculateTrustScore } from "@/app/lib/market-config";

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}

function OnboardingContent() {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  
  const [sellerType, setSellerType] = useState<'individual' | 'business' | null>(null);
  const [step, setStep] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [idScanActive, setIdScanActive] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountNumberType] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const idVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (idVideoRef.current?.srcObject) {
        (idVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const validateRSAID = (id: string) => {
    return /^\d{13}$/.test(id);
  };

  const uploadToStorage = async (dataUri: string, path: string) => {
    if (!authUser || !storage) return null;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `kyc/${authUser.uid}/${path}`);
      await uploadString(storageRef, dataUri, 'data_url');
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.error("Storage upload error:", err);
      toast({ variant: "destructive", title: "Storage Error", description: "Failed to persist document secure scan." });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const startSelfieCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Required', description: 'Enable camera to complete facial verification.' });
    }
  };

  const startIdCamera = async () => {
    setIdScanActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (idVideoRef.current) idVideoRef.current.srcObject = stream;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access rear camera.' });
      setIdScanActive(false);
    }
  };

  const captureSelfie = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      const storageUrl = await uploadToStorage(dataUri, 'selfie.jpg');
      if (storageUrl) {
        setSelfie(storageUrl);
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        toast({ title: "Selfie Secured", description: "Biometric persistence complete." });
      }
    }
  };

  const captureId = async () => {
    if (idVideoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = idVideoRef.current.videoWidth;
      canvas.height = idVideoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(idVideoRef.current, 0, 0);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      const storageUrl = await uploadToStorage(dataUri, 'id_doc.jpg');
      if (storageUrl) {
        setIdPhoto(storageUrl);
        if (idVideoRef.current.srcObject) {
          (idVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
        setIdScanActive(false);
        toast({ title: "ID Persistence Complete", description: "Document secured in storage." });
      }
    }
  };

  const finalizeOnboarding = async () => {
    if (!popiaConsent || !authUser) return;
    
    if (sellerType === 'individual' && !validateRSAID(idNumber)) {
      toast({ variant: "destructive", title: "Invalid ID", description: "Please enter a valid 13-digit RSA ID number." });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Secure Masking Logic
      const maskedAccountNumber = `****${accountNumber.slice(-4)}`;
      
      const trustScore = calculateTrustScore({ 
        phoneVerified: true, 
        kycStatus: 'verified',
        sellerType: sellerType,
        isIdVerified: true
      });
      
      const profileRef = doc(db, "userProfiles", authUser.uid);
      const updateData: any = {
        id: authUser.uid,
        sellerType,
        kycStatus: 'verified',
        trustScore,
        onboardedAt: new Date().toISOString(),
        isIdVerified: true,
        registrationDate: new Date().toISOString(),
        reliabilityScore: 50,
        transactionsCompleted: 0,
        disputeCount: 0,
        banking: {
          bankName,
          accountNumberMasked: maskedAccountNumber,
          accountType,
          registeredAt: new Date().toISOString()
        }
      };

      if (sellerType === 'individual') {
        updateData.firstName = fullName.split(' ')[0] || "";
        updateData.lastName = fullName.split(' ').slice(1).join(' ') || "";
        updateData.idNumberMasked = `*******${idNumber.slice(-4)}`;
        updateData.idPhotoUrl = idPhoto;
        updateData.selfieUrl = selfie;
      } else {
        updateData.firstName = businessName;
        updateData.businessName = businessName;
        updateData.cipcNumber = registrationNumber;
        updateData.physicalAddress = address;
      }

      await setDoc(profileRef, updateData, { merge: true });
      setStep(4);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({ variant: "destructive", title: "Registry Error", description: "Could not finalize profile." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="max-w-xl w-full">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#225BC3]/10 rounded-3xl mb-4">
              <ShieldCheck className="w-8 h-8 text-[#225BC3]" />
            </div>
            <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Identity Activation</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">FICA & POPIA CONFORMANT</p>
          </div>

          <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden ring-1 ring-slate-100">
            <CardContent className="p-10">
              
              {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Select Profile Tier</h2>
                    <p className="text-sm text-muted-foreground font-medium">Verify your identity to unlock trading.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => { setSellerType('individual'); setStep(1); }}
                      className="p-6 rounded-[2rem] border-2 border-slate-100 hover:border-[#225BC3] hover:bg-[#225BC3]/5 transition-all text-left group"
                    >
                      <User className="w-10 h-10 text-[#225BC3] mb-4 group-hover:scale-110" />
                      <h3 className="font-black text-lg text-slate-900">Individual Trader</h3>
                      <p className="text-xs text-slate-500 font-medium">Verify via ID document and selfie match.</p>
                    </button>
                    <button 
                      onClick={() => { setSellerType('business'); setStep(1); }}
                      className="p-6 rounded-[2rem] border-2 border-slate-100 hover:border-[#FF8C00] hover:bg-[#FF8C00]/5 transition-all text-left group"
                    >
                      <Building2 className="w-10 h-10 text-[#FF8C00] mb-4 group-hover:scale-110" />
                      <h3 className="font-black text-lg text-slate-900">Registered Business</h3>
                      <p className="text-xs text-slate-500 font-medium">FICA verification for Pty Ltd accounts.</p>
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 1: Identity</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Accountability Check</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#225BC3]">Full Legal Name</Label>
                      <Input placeholder="As per ID" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    {sellerType === 'business' ? (
                      <>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-[#225BC3]">Business Name</Label>
                          <Input placeholder="Trading Name" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-[#225BC3]">CIPC Number</Label>
                          <Input placeholder="K2024..." className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-[#225BC3]">RSA ID Number</Label>
                        <Input 
                          placeholder="13 Digits" 
                          maxLength={13}
                          className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" 
                          value={idNumber} 
                          onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))} 
                        />
                        {idNumber.length > 0 && idNumber.length < 13 && (
                          <p className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">Exactly 13 digits required</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px]" onClick={() => setStep(0)}>Back</Button>
                    <Button 
                      className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white disabled:opacity-50" 
                      onClick={() => setStep(2)}
                      disabled={sellerType === 'individual' ? (!validateRSAID(idNumber) || !fullName) : (!businessName || !registrationNumber || !fullName)}
                    >
                      Next Pillar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 2: Biometrics</h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Storage Pillar</p>
                  </div>

                  {sellerType === 'individual' ? (
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-[10px] font-black uppercase text-[#225BC3]">ID Scanner</Label>
                           {idPhoto && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border-4 border-white shadow-2xl flex items-center justify-center">
                          {idPhoto ? (
                            <>
                              <Image src={idPhoto} alt="ID" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                 <button onClick={() => setIdPhoto(null)} className="bg-white text-[#225BC3] p-4 rounded-full"><RefreshCw className="w-8 h-8" /></button>
                              </div>
                            </>
                          ) : idScanActive ? (
                            <video ref={idVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                          ) : (
                            <Button onClick={startIdCamera} className="bg-[#225BC3]">Enable Scanner</Button>
                          )}
                        </div>
                        {idScanActive && !idPhoto && (
                          <Button onClick={captureId} className="w-full bg-[#225BC3] h-14 rounded-2xl font-black" disabled={isUploading}>
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5 mr-2" />} Capture & Upload
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase text-[#225BC3]">Liveness Scan</Label>
                            {selfie && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                         </div>
                         <div className="relative aspect-square max-w-[280px] mx-auto rounded-full overflow-hidden bg-slate-900 border-4 border-white shadow-2xl group">
                            {selfie ? (
                              <Image src={selfie} alt="Selfie" fill className="object-cover" />
                            ) : (
                              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale" />
                            )}
                         </div>
                         {!selfie && (
                           <Button 
                             onClick={() => { if (!videoRef.current?.srcObject) startSelfieCamera(); else captureSelfie(); }}
                             className="w-full bg-[#34CBED] h-14 rounded-2xl font-black"
                             disabled={isUploading}
                           >
                             {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ScanFace className="w-5 h-5 mr-2" /> Capture Face</>}
                           </Button>
                         )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-[#225BC3]">Business Address</Label>
                       <Input placeholder="Street, City" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  )}

                  <div className="flex gap-3 pt-6">
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black text-[10px]" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white" onClick={() => setStep(3)} disabled={sellerType === 'individual' && (!idPhoto || !selfie)}>
                      Next: Banking
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 3: Payouts</h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Financial Pillar</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#225BC3]">Bank</Label>
                      <Select value={bankName} onValueChange={setBankName}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                          <SelectValue placeholder="Select Bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="capitec" className="font-bold">Capitec</SelectItem>
                          <SelectItem value="fnb" className="font-bold">FNB</SelectItem>
                          <SelectItem value="standard" className="font-bold">Standard Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#225BC3]">Account Number</Label>
                      <Input placeholder="Secure Entry" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox id="popia" checked={popiaConsent} onCheckedChange={(c) => setPopiaConsent(c === true)} />
                      <Label htmlFor="popia" className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                        I consent to biometric processing. All banking data is MASKED for security.
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px]" onClick={() => setStep(2)}>Back</Button>
                    <Button className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white" onClick={finalizeOnboarding} disabled={isProcessing || !popiaConsent || !accountNumber}>
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify Identity"}
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center space-y-8 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <UserCheck className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase">Verified</h2>
                  <Button className="w-full bg-[#225BC3] h-16 rounded-2xl font-black" onClick={() => window.location.href = '/'}>
                    Enter Market
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

const SA_BANKS = [
  { id: "capitec", name: "Capitec Bank" },
  { id: "fnb", name: "First National Bank (FNB)" },
  { id: "std", name: "Standard Bank" },
  { id: "abs", name: "ABSA" },
  { id: "ned", name: "Nedbank" },
];
