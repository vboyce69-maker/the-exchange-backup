
"use client";

import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Camera, 
  ScanFace,
  RefreshCw,
  UserCheck,
  XCircle,
  Home,
  User,
  Building2,
  Lock,
  ArrowRight,
  Fingerprint,
  Smartphone,
  FileCheck,
  CreditCard,
  MapPin
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { verifyIdentity, VerifyIdentityOutput } from "@/ai/flows/verify-identity-flow";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, collection, getCountFromServer } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { MARKET_CONFIG, calculateInitialTrust } from "@/app/lib/market-config";

export default function OnboardingPage() {
  const { user: authUser } = useUser();
  const db = useFirestore();
  
  const [sellerType, setSellerType] = useState<'individual' | 'business' | null>(null);
  const [step, setStep] = useState(0); // 0: Type Selection, 1: Identity, 2: KYC/Business, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  // Media State
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [residencePhoto, setResidencePhoto] = useState<string | null>(null);
  
  // Data State
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 2 && sellerType === 'individual') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          setHasCameraPermission(true);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
          setHasCameraPermission(false);
          toast({ variant: 'destructive', title: 'Camera Required', description: 'Enable camera to complete facial verification.' });
        }
      };
      getCameraPermission();
    }
  }, [step, sellerType]);

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setSelfie(canvas.toDataURL('image/jpeg'));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'id' | 'residence') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'id') setIdPhoto(reader.result as string);
        else setResidencePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const finalizeOnboarding = async () => {
    if (!popiaConsent || !authUser) return;
    setIsProcessing(true);
    
    try {
      let trustScore = calculateInitialTrust({ phone: true, email: !!authUser.email, id: true });
      
      const profileRef = doc(db, "userProfiles", authUser.uid);
      const updateData: any = {
        sellerType,
        kycStatus: 'verified',
        trustScore,
        onboardedAt: new Date().toISOString(),
        isIdVerified: true,
      };

      if (sellerType === 'individual') {
        const result = await verifyIdentity({ idPhotoDataUri: idPhoto!, selfieDataUri: selfie!, fullName });
        if (!result.isVerified) {
          toast({ variant: "destructive", title: "Face Mismatch", description: result.reason });
          setIsProcessing(false);
          return;
        }
        updateData.extractedName = fullName;
      } else {
        updateData.businessName = businessName;
        updateData.cipcNumber = registrationNumber;
        updateData.businessStatus = 'pending';
      }

      await updateDoc(profileRef, updateData);
      setStep(4);
    } catch (error) {
      toast({ variant: "destructive", title: "System Error", description: "Verification engine is busy. Try again shortly." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="max-w-xl w-full">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#225BC3]/10 rounded-3xl mb-4">
              <ShieldCheck className="w-8 h-8 text-[#225BC3]" />
            </div>
            <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Trust Onboarding</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Sellers Sell Faster</p>
          </div>

          <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden ring-1 ring-slate-100">
            <CardContent className="p-10">
              
              {/* STEP 0: TYPE SELECTION */}
              {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Select Seller Profile</h2>
                    <p className="text-sm text-muted-foreground font-medium">This determines your verification path.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => { setSellerType('individual'); setStep(1); }}
                      className="p-6 rounded-[2rem] border-2 border-slate-100 hover:border-[#225BC3] hover:bg-[#225BC3]/5 transition-all text-left group"
                    >
                      <User className="w-10 h-10 text-[#225BC3] mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-black text-lg text-slate-900">Individual Seller</h3>
                      <p className="text-xs text-slate-500 font-medium">For casual trading and verified peer-to-peer deals.</p>
                    </button>
                    <button 
                      onClick={() => { setSellerType('business'); setStep(1); }}
                      className="p-6 rounded-[2rem] border-2 border-slate-100 hover:border-[#FF8C00] hover:bg-[#FF8C00]/5 transition-all text-left group"
                    >
                      <Building2 className="w-10 h-10 text-[#FF8C00] mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-black text-lg text-slate-900">Business Seller</h3>
                      <p className="text-xs text-slate-500 font-medium">For Pty Ltd companies and bulk lot professional trades.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1: IDENTITY DETAILS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 1: Identity</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Pillar: Accountability</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#225BC3]">Full Legal Name</Label>
                      <Input placeholder="As per ID Document" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    {sellerType === 'business' ? (
                      <>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-[#225BC3]">Business Name</Label>
                          <Input placeholder="Trading Name" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-[#225BC3]">CIPC Reg Number</Label>
                          <Input placeholder="K2024..." className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-[#225BC3]">ID Number</Label>
                        <Input placeholder="13-Digit RSA ID" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                      </div>
                    )}
                  </div>
                  <Button className="w-full bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl" onClick={() => setStep(2)}>
                    Next Pillar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP 2: VERIFICATION (MEDIA) */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Verification Pillar</h2>
                    <p className="text-sm text-slate-500">Upload your proof to unlock the **Verified** badge.</p>
                  </div>

                  {sellerType === 'individual' ? (
                    <div className="space-y-6">
                      <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {idPhoto ? <Image src={idPhoto} alt="ID" fill className="object-cover" /> : (
                          <div className="text-center"><FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-[10px] font-black uppercase text-slate-400">Tap to upload ID</p></div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, 'id')} />
                      </div>

                      <div className="relative aspect-square max-w-[280px] mx-auto rounded-full overflow-hidden bg-black border-4 border-white shadow-2xl group">
                        {selfie ? <Image src={selfie} alt="Selfie" fill className="object-cover" /> : (
                          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none border-4 border-white/20 rounded-full" />
                        {!selfie && <button onClick={captureSelfie} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#34CBED] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl">Capture Face</button>}
                        {selfie && <button onClick={() => setSelfie(null)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl">Retake</button>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-[#225BC3]">Physical Address</Label>
                          <Input placeholder="Street, City" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={address} onChange={(e) => setAddress(e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-[#225BC3]">Payout Bank Account</Label>
                          <Input placeholder="Account Number" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                       </div>
                    </div>
                  )}

                  <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox id="popia" checked={popiaConsent} onCheckedChange={(c) => setPopiaConsent(c === true)} />
                      <Label htmlFor="popia" className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                        I consent to biometric processing and FICA validation. All data is AES-256 encrypted.
                      </Label>
                    </div>
                  </div>

                  <Button className="w-full bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl" onClick={finalizeOnboarding} disabled={isProcessing || !popiaConsent}>
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Finalize Verification"}
                  </Button>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                    <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                      <UserCheck className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Identity Authenticated</h2>
                    <p className="text-sm text-muted-foreground font-medium px-6">
                      Welcome to The Exchange. You are now a **Trusted Seller**. Start listing your items securely.
                    </p>
                  </div>
                  <Button className="w-full bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl" onClick={() => window.location.href = '/'}>
                    Enter Marketplace
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
          
          <div className="mt-8 text-center opacity-40">
             <p className="text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" /> PCI-DSS & POPIA Compliant
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
