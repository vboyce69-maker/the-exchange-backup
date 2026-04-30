
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
  Smartphone,
  FileText,
  MapPin,
  Lock,
  Search,
  Fingerprint
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { verifyIdentity, VerifyIdentityOutput } from "@/ai/flows/verify-identity-flow";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function VerificationPage() {
  const { user: authUser } = useUser();
  const db = useFirestore();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [residencePhoto, setResidencePhoto] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerifyIdentityOutput | null>(null);
  const [popiaConsent, setPopiaConsent] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (step === 3) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to complete facial verification.',
          });
        }
      };
      getCameraPermission();
    }
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setSelfie(dataUri);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'id' | 'residence') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'id') setIdPhoto(reader.result as string);
        else setResidencePhoto(reader.result as string);
        toast({ title: "File Captured", description: "Document added to your verification profile." });
      };
      reader.readAsDataURL(file);
    }
  };

  const runVerification = async () => {
    if (!idPhoto || !selfie || !popiaConsent || !authUser) return;
    setIsProcessing(true);
    try {
      // AI DEEP MATCHING ENGINE TRIGGER
      const result = await verifyIdentity({
        idPhotoDataUri: idPhoto,
        selfieDataUri: selfie,
        fullName: fullName
      });
      
      setVerificationResult(result);

      if (result.isVerified) {
        // PERMANENT STATE UPDATE IN FIRESTORE
        const profileRef = doc(db, "userProfiles", authUser.uid);
        await updateDoc(profileRef, {
          isIdVerified: true,
          verifiedAt: new Date().toISOString(),
          reliabilityScore: 80, // New verified users start with higher trust
          extractedName: fullName,
          identityConfidence: result.confidenceScore
        });
        
        setStep(6); // Success
      } else {
        setStep(5); // Failure
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Verification Error", description: "AI engine is busy. Please try again in 60 seconds." });
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, name: "Identity & Address", icon: MapPin },
    { id: 2, name: "ID Document", icon: FileText },
    { id: 3, name: "Biometric Scan", icon: ScanFace },
    { id: 4, name: "Proof of Residence", icon: Home },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="max-w-xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#225BC3]/10 rounded-[2rem] mb-6 shadow-xl relative overflow-hidden group">
              <ShieldCheck className="w-10 h-10 text-[#225BC3] relative z-10" />
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700" />
            </div>
            <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter uppercase">Verified Person</h1>
            <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> FICA & POPIA Compliant Onboarding
            </p>
          </div>

          <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="p-8 pb-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Step {step > 4 ? 4 : step} of 4
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 w-8 rounded-full transition-all duration-500",
                        step >= i ? 'bg-[#225BC3]' : 'bg-slate-100'
                      )} 
                    />
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-10">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-[#225BC3]" /> Pillar 1: Identity & Address
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium">Verify your primary details to start the trust process.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Full Legal Name</Label>
                      <Input 
                        placeholder="Name exactly as on ID" 
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Physical Address</Label>
                      <Input 
                        placeholder="Street, Suburb" 
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">City</Label>
                        <Input 
                          placeholder="City" 
                          className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">ID Number</Label>
                        <Input 
                          placeholder="13-Digit ID" 
                          className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#225BC3] text-white font-black h-16 rounded-2xl shadow-xl active:scale-[0.98] transition-transform" 
                    onClick={() => setStep(2)}
                    disabled={!fullName || !idNumber || !address}
                  >
                    Continue to Pillar 2
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Pillar 2: ID Document</h2>
                    <p className="text-sm text-muted-foreground font-medium">RSA ID Card, Driver's License or Passport.</p>
                  </div>
                  
                  {idPhoto ? (
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                      <Image src={idPhoto} alt="ID Document" fill className="object-cover" />
                      <button 
                        onClick={() => setIdPhoto(null)}
                        className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={(e) => handleFileUpload(e, 'id')} 
                      />
                      <div 
                        className="border-4 border-dashed border-[#225BC3]/10 rounded-[2.5rem] p-16 text-center cursor-pointer hover:bg-[#225BC3]/5 transition-all flex flex-col items-center group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-[#225BC3] mb-4 group-hover:scale-110 transition-transform" />
                        <p className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Select ID Photo</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-2">Maximum file size: 10MB</p>
                      </div>
                    </>
                  )}

                  <Button 
                    className="w-full bg-[#225BC3] text-white font-black h-16 rounded-2xl shadow-xl" 
                    onClick={() => setStep(3)}
                    disabled={!idPhoto}
                  >
                    Continue to Biometric Scan
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Pillar 3: Biometric Scan</h2>
                    <p className="text-sm text-muted-foreground font-medium">Position your face within the guide to verify.</p>
                  </div>

                  <div className="relative aspect-square max-w-[320px] mx-auto rounded-[3rem] lg:rounded-full overflow-hidden border-8 border-slate-100 shadow-2xl bg-black group">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    
                    {/* Biometric UI Guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-48 h-64 border-2 border-white/40 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#34CBED] rounded-full animate-ping" />
                       </div>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                    
                    {selfie && (
                      <div className="absolute inset-0 bg-white">
                        <Image src={selfie} alt="Selfie" fill className="object-cover rounded-full" />
                        <div className="absolute inset-0 bg-[#225BC3]/20 flex items-center justify-center">
                           <CheckCircle2 className="w-16 h-16 text-white drop-shadow-2xl" />
                        </div>
                        <button onClick={() => setSelfie(null)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#225BC3] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg">Retake</button>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full h-16 bg-[#34CBED] text-white font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-transform"
                    onClick={selfie ? () => setStep(4) : captureSelfie}
                  >
                    {selfie ? "Continue to Pillar 4" : "Capture Biometric Face Scan"}
                  </Button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Pillar 4: Proof of Residence</h2>
                    <p className="text-sm text-muted-foreground font-medium">Utility bill, statement, or lease (under 3 months).</p>
                  </div>

                  {residencePhoto ? (
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                      <Image src={residencePhoto} alt="Residence Proof" fill className="object-cover" />
                      <button onClick={() => setResidencePhoto(null)} className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black transition-colors"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="residenceInput" 
                        onChange={(e) => handleFileUpload(e, 'residence')} 
                      />
                      <div 
                        className="border-4 border-dashed border-[#225BC3]/10 rounded-[2.5rem] p-16 text-center cursor-pointer hover:bg-[#225BC3]/5 transition-all flex flex-col items-center group"
                        onClick={() => document.getElementById('residenceInput')?.click()}
                      >
                        <Home className="w-12 h-12 text-[#225BC3] mb-4 group-hover:scale-110 transition-transform" />
                        <p className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Select Address Proof</p>
                      </div>
                    </>
                  )}

                  <div className="p-6 bg-[#225BC3]/5 rounded-3xl border border-[#225BC3]/10 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="popia" 
                        checked={popiaConsent}
                        onCheckedChange={(checked) => setPopiaConsent(checked === true)}
                      />
                      <label htmlFor="popia" className="text-[10px] font-bold text-[#225BC3] leading-relaxed cursor-pointer uppercase select-none">
                        I consent to biometric processing, facial landmark matching, and FICA validation for secure trading.
                      </label>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-16 bg-[#225BC3] text-white font-black rounded-2xl shadow-xl relative overflow-hidden"
                    onClick={runVerification}
                    disabled={isProcessing || !residencePhoto || !popiaConsent}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Running AI Facial Recognition...</span>
                      </div>
                    ) : "Finalize & Submit Verification"}
                  </Button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Verification Failed</h2>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4">
                    {verificationResult?.reason || "Our AI detected a face mismatch or data inconsistency between your ID and Selfie."}
                  </p>
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-[#225BC3] font-black text-[#225BC3]" onClick={() => setStep(1)}>Restart Process</Button>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8 text-center animate-in fade-in zoom-in-95">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                    <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                      <UserCheck className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Identity Authenticated</h2>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed px-6">
                      AI Recognition matched your selfie with your ID perfectly. You are now a **Trusted Seller** with the **Verified** badge.
                    </p>
                  </div>
                  <Button 
                    className="w-full h-16 bg-[#225BC3] text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform" 
                    onClick={() => window.location.href = '/'}
                  >
                    Enter Marketplace
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center opacity-40">
             <p className="text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Biometric Data Encrypted (AES-256)
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}
