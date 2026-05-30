"use client";

import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  MapPin,
  Banknote,
  Maximize2,
  Cpu
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, collection, getCountFromServer } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { MARKET_CONFIG, calculateTrustScore } from "@/app/lib/market-config";

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
  
  const [sellerType, setSellerType] = useState<'individual' | 'business' | null>(null);
  const [step, setStep] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
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

  const startSelfieCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setHasCameraPermission(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Required', description: 'Enable camera to complete facial verification.' });
    }
  };

  const startIdCamera = async () => {
    setIdScanActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (idVideoRef.current) idVideoRef.current.srcObject = stream;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access rear camera for ID scanning.' });
      setIdScanActive(false);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setSelfie(canvas.toDataURL('image/jpeg'));
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      toast({ title: "Selfie Captured", description: "Biometric image ready for storage." });
    }
  };

  const captureId = () => {
    if (idVideoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = idVideoRef.current.videoWidth;
      canvas.height = idVideoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(idVideoRef.current, 0, 0);
      setIdPhoto(canvas.toDataURL('image/jpeg'));
      if (idVideoRef.current.srcObject) {
        (idVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      setIdScanActive(false);
      toast({ title: "ID Scanned", description: "Document snapshot secured in-app." });
    }
  };

  const finalizeOnboarding = async () => {
    if (!popiaConsent || !authUser) return;
    setIsProcessing(true);
    
    try {
      const trustScore = calculateTrustScore({ 
        phoneVerified: true, 
        kycStatus: 'verified',
        sellerType: sellerType
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
          accountNumber,
          accountType,
          registeredAt: new Date().toISOString()
        }
      };

      if (sellerType === 'individual') {
        updateData.firstName = fullName.split(' ')[0] || "";
        updateData.lastName = fullName.split(' ').slice(1).join(' ') || "";
        updateData.idNumber = idNumber;
        updateData.verificationPhotosStored = !!(idPhoto && selfie);
      } else {
        updateData.firstName = businessName;
        updateData.businessName = businessName;
        updateData.cipcNumber = registrationNumber;
        updateData.businessStatus = 'pending';
        updateData.physicalAddress = address;
      }

      await setDoc(profileRef, updateData, { merge: true });
      setStep(4);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({ variant: "destructive", title: "System Error", description: "Registration engine encountered a delay. Try again shortly." });
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
            <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Seller Hub Onboarding</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Register • Verify • Sell</p>
          </div>

          <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden ring-1 ring-slate-100">
            <CardContent className="p-10">
              
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
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px]" onClick={() => setStep(0)}>Back</Button>
                    <Button className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl border-none" onClick={() => setStep(2)}>
                      Next Pillar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 2: Verification</h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Pillar: Identity Confirmation</p>
                  </div>

                  {sellerType === 'individual' ? (
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-[10px] font-black uppercase text-[#225BC3] tracking-widest">1. ID Document Scanner</Label>
                           {idPhoto && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border-4 border-white shadow-2xl ring-1 ring-slate-100 flex items-center justify-center group">
                          {idPhoto ? (
                            <>
                              <Image src={idPhoto} alt="ID" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                 <button 
                                  onClick={() => setIdPhoto(null)} 
                                  className="bg-white text-[#225BC3] p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                 >
                                    <RefreshCw className="w-8 h-8" />
                                 </button>
                              </div>
                            </>
                          ) : idScanActive ? (
                            <>
                              <video ref={idVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                 <div className="w-[85%] h-[75%] border-2 border-dashed border-[#34CBED]/60 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                                    <div className="absolute inset-0 border-2 border-[#34CBED] rounded-2xl animate-pulse" />
                                    <div className="absolute left-0 right-0 h-[2px] bg-[#34CBED] shadow-[0_0_15px_#34CBED] top-0 animate-[scan_2s_linear_infinite]" style={{
                                      animation: 'scan 3s linear infinite'
                                    }} />
                                    <style jsx>{`
                                      @keyframes scan {
                                        0% { top: 0%; }
                                        100% { top: 100%; }
                                      }
                                    `}</style>
                                 </div>
                                 <p className="absolute bottom-6 text-[8px] font-black uppercase text-white tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                                   Align ID card within frame
                                 </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center space-y-4 p-8">
                               <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto">
                                  <Camera className="w-8 h-8 text-white/60" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase text-white tracking-widest">In-App Live Scanner</p>
                                  <p className="text-[8px] text-white/40 font-bold mt-1 leading-relaxed">Ensure all text is visible and clearly lit</p>
                               </div>
                               <Button onClick={startIdCamera} className="bg-[#225BC3] text-white h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none">
                                 Start Scanner
                               </Button>
                            </div>
                          )}
                        </div>
                        {idScanActive && !idPhoto && (
                          <div className="flex justify-center pt-2">
                            <Button 
                              onClick={captureId}
                              className="w-full bg-[#225BC3] text-white h-14 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-none"
                            >
                              <Camera className="w-5 h-5 mr-2" /> Capture Document
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase text-[#225BC3] tracking-widest">2. Biometric Facial Scan</Label>
                            {selfie && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                         </div>
                         <div className="relative aspect-square max-w-[280px] mx-auto rounded-full overflow-hidden bg-slate-900 border-4 border-white shadow-2xl ring-1 ring-slate-100 group">
                            {selfie ? (
                              <>
                                <Image src={selfie} alt="Selfie" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                   <button 
                                    onClick={() => setSelfie(null)} 
                                    className="bg-white text-[#225BC3] p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                   >
                                      <RefreshCw className="w-8 h-8" />
                                   </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale brightness-110" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                   <div className="w-[85%] h-[85%] border-4 border-dashed border-[#34CBED]/40 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                                      <div className="absolute inset-0 border-2 border-[#34CBED] rounded-full animate-pulse opacity-20" />
                                   </div>
                                   <p className="absolute bottom-16 text-[8px] font-black uppercase text-white tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                                     Center face in circle
                                   </p>
                                </div>
                              </>
                            )}
                         </div>
                         {!selfie && (
                           <div className="flex justify-center pt-2">
                             <Button 
                               onClick={() => {
                                 if (!videoRef.current?.srcObject) startSelfieCamera();
                                 else captureSelfie();
                               }}
                               className="w-full bg-[#34CBED] text-white h-14 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-none"
                             >
                               {!videoRef.current?.srcObject ? (
                                 <span className="flex items-center gap-2"><ScanFace className="w-5 h-5" /> Enable Face Scan</span>
                               ) : (
                                 <span className="flex items-center gap-2"><Camera className="w-5 h-5" /> Capture Face</span>
                               )}
                             </Button>
                           </div>
                         )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-[#225BC3]">Physical Business Address</Label>
                          <Input placeholder="Street, City, Province" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={address} onChange={(e) => setAddress(e.target.value)} />
                       </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6">
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px]" onClick={() => setStep(1)}>Back</Button>
                    <Button 
                      className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl border-none" 
                      onClick={() => setStep(3)}
                      disabled={sellerType === 'individual' && (!idPhoto || !selfie)}
                    >
                      Banking Registration <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 3: Banking</h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Pillar: Verified Payouts</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-[#225BC3]" />
                      <p className="text-[10px] font-bold text-blue-700 leading-tight">
                        Register your local South African bank account to receive funds from Protected Hold transactions.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#225BC3]">Bank Name</Label>
                      <Select value={bankName} onValueChange={setBankName}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          {SA_BANKS.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id} className="font-bold">
                              {bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#225BC3]">Account Number</Label>
                      <Input placeholder="1234567890" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-[#225BC3]">Account Type</Label>
                      <Input placeholder="Savings / Cheque" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={accountType} onChange={(e) => setAccountNumberType(e.target.value)} />
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox id="popia" checked={popiaConsent} onCheckedChange={(c) => setPopiaConsent(c === true)} />
                      <Label htmlFor="popia" className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                        I consent to biometric processing and FICA validation. All banking data is AES-256 encrypted for payouts only.
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px]" onClick={() => setStep(2)}>Back</Button>
                    <Button className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl border-none" onClick={finalizeOnboarding} disabled={isProcessing || !popiaConsent || !accountNumber}>
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Finalize Registration"}
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                    <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                      <UserCheck className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Hub Activated</h2>
                    <p className="text-sm text-muted-foreground font-medium px-6 leading-relaxed">
                      Identity & Financials verified. You are now a **Trusted Seller**. Your listings are platform-protected.
                    </p>
                  </div>
                  <Button className="w-full bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl border-none" onClick={() => window.location.href = '/'}>
                    Enter Marketplace
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
  { id: "tyme", name: "TymeBank" },
  { id: "afri", name: "African Bank" },
  { id: "disc", name: "Discovery Bank" },
  { id: "bidv", name: "Bidvest Bank" },
  { id: "sasf", name: "SASFIN" },
];
