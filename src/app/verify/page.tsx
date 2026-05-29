"use client";

import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
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
import { verifyIdentity, VerifyIdentityOutput } from "@/ai/flows/verify-identity-flow";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, collection, getCountFromServer } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { MARKET_CONFIG, calculateTrustScore } from "@/app/lib/market-config";

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

export default function OnboardingPage() {
  const { user: authUser } = useUser();
  const db = useFirestore();
  
  const [sellerType, setSellerType] = useState<'individual' | 'business' | null>(null);
  const [step, setStep] = useState(0); // 0: Type Selection, 1: Identity, 2: Verification, 3: Banking, 4: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  // Media State
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [idScanActive, setIdScanActive] = useState(false);
  
  // Data State
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  
  // Banking State
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountNumberType] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const idVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stop all camera streams on unmount
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
      // Stop track after capture
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      toast({ title: "Selfie Captured", description: "Biometric image ready for analysis." });
    }
  };

  const captureId = () => {
    if (idVideoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = idVideoRef.current.videoWidth;
      canvas.height = idVideoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(idVideoRef.current, 0, 0);
      setIdPhoto(canvas.toDataURL('image/jpeg'));
      // Stop track after capture
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
      // PERFORM AI IDENTITY VERIFICATION
      if (sellerType === 'individual') {
        if (!idPhoto || !selfie) {
           toast({ variant: "destructive", title: "Media Required", description: "Please upload ID and capture a live selfie." });
           setIsProcessing(false);
           return;
        }

        // Show specialized toast for AI analysis
        toast({ title: "AI Analysis in Progress", description: "Our Senior Security Agent is comparing your biometric data..." });

        const result = await verifyIdentity({ 
          idPhotoDataUri: idPhoto!, 
          selfieDataUri: selfie!, 
          fullName 
        });

        if (!result.isVerified) {
          toast({ 
            variant: "destructive", 
            title: "Identity Verification Failed", 
            description: result.reason || "The faces in the photos do not match our high-confidence threshold." 
          });
          setIsProcessing(false);
          return;
        }

        toast({ title: "Identity Verified", description: "Facial match successful. Confidence: " + result.confidenceScore + "%" });
      }

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
      toast({ variant: "destructive", title: "System Error", description: "Verification engine is busy. Try again shortly." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      {/* Hidden canvas for processing captures */}
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
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px]" onClick={() => setStep(0)}>Back</Button>
                    <Button className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl" onClick={() => setStep(2)}>
                      Next Pillar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: VERIFICATION (MEDIA / ADDRESS) */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 2: Verification</h2>
                    <p className="text-sm text-slate-500">Pillar: Live Biometric Assets</p>
                  </div>

                  {sellerType === 'individual' ? (
                    <div className="space-y-8">
                      {/* ID Scanner Section */}
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-[#225BC3] tracking-widest text-center block">1. ID Document Scanner</Label>
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border-4 border-white shadow-2xl ring-1 ring-slate-100 flex items-center justify-center group">
                          {idPhoto ? (
                            <>
                              <Image src={idPhoto} alt="ID" fill className="object-cover" />
                              <button 
                                onClick={() => setIdPhoto(null)} 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white p-4 rounded-full backdrop-blur-md hover:scale-110 active:scale-95 transition-all shadow-2xl z-20"
                              >
                                 <RefreshCw className="w-6 h-6" />
                              </button>
                            </>
                          ) : idScanActive ? (
                            <>
                              <video ref={idVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                              <div className="absolute inset-4 border-2 border-[#34CBED]/40 rounded-xl pointer-events-none flex items-center justify-center">
                                 <div className="w-full h-[1px] bg-[#34CBED]/60 absolute animate-pulse shadow-[0_0_10px_#34CBED]" />
                                 <p className="text-[7px] font-black uppercase text-white/40 tracking-widest mt-auto mb-2">Align ID card within frame</p>
                              </div>
                              <Button 
                                onClick={captureId}
                                className="absolute bottom-4 bg-white text-[#225BC3] h-10 px-6 rounded-full font-black text-[9px] uppercase shadow-2xl hover:scale-105 active:scale-95"
                              >
                                Capture ID
                              </Button>
                            </>
                          ) : (
                            <div className="text-center space-y-4 p-8">
                               <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto">
                                  <Camera className="w-8 h-8 text-white/60" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase text-white tracking-widest">In-App Live Scanner</p>
                                  <p className="text-[8px] text-white/40 font-bold mt-1">Place ID on flat surface with good lighting</p>
                               </div>
                               <Button onClick={startIdCamera} className="bg-[#225BC3] text-white h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                 Start Scanner
                               </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selfie Section */}
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase text-[#225BC3] tracking-widest text-center block">2. Biometric Liveness</Label>
                         <div className="relative aspect-square max-w-[240px] mx-auto rounded-full overflow-hidden bg-slate-900 border-4 border-white shadow-2xl ring-1 ring-slate-100 group">
                            {selfie ? (
                              <>
                                <Image src={selfie} alt="Selfie" fill className="object-cover" />
                                <button 
                                  onClick={() => setSelfie(null)} 
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white p-4 rounded-full backdrop-blur-md hover:scale-110 active:scale-95 transition-all shadow-2xl z-20"
                                >
                                   <RefreshCw className="w-6 h-6" />
                                </button>
                              </>
                            ) : (
                              <>
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale brightness-110" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                   <div className="w-[85%] h-[85%] border-2 border-dashed border-[#34CBED]/20 rounded-full" />
                                </div>
                                <button 
                                  onClick={() => {
                                    if (!videoRef.current?.srcObject) startSelfieCamera();
                                    else captureSelfie();
                                  }}
                                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#34CBED] text-white px-8 h-10 rounded-full font-black text-[9px] uppercase shadow-2xl hover:scale-105 active:scale-95"
                                >
                                  {!videoRef.current?.srcObject ? "Enable Camera" : "Capture Face"}
                                </button>
                              </>
                            )}
                         </div>
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
                      className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl" 
                      onClick={() => setStep(3)}
                      disabled={sellerType === 'individual' && (!idPhoto || !selfie)}
                    >
                      Financial Registration <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: BANKING DETAILS */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">Step 3: Banking</h2>
                    <p className="text-sm text-slate-500">Pillar: Payouts & Escrow</p>
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
                    <Button className="flex-[2] bg-[#225BC3] h-16 rounded-2xl font-black text-white shadow-xl" onClick={finalizeOnboarding} disabled={isProcessing || !popiaConsent || !accountNumber}>
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Finalize Registration"}
                    </Button>
                  </div>
                  
                  {isProcessing && (
                    <div className="p-4 bg-[#225BC3]/5 rounded-2xl border border-[#225BC3]/10 flex items-center justify-center gap-3 animate-pulse">
                      <Cpu className="w-4 h-4 text-[#225BC3] animate-spin" />
                      <span className="text-[10px] font-black uppercase text-[#225BC3]">Running AI Identity Comparison...</span>
                    </div>
                  )}
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
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Hub Activated</h2>
                    <p className="text-sm text-muted-foreground font-medium px-6">
                      Identity & Financials verified. You are now a **Trusted Seller**. Your listings are platform-protected.
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
