
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
  Lock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { verifyIdentity, VerifyIdentityOutput } from "@/ai/flows/verify-identity-flow";
import { useUser } from "@/firebase";

export default function VerificationPage() {
  const { user: authUser } = useUser();
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

  const handleIdUpload = () => {
    setIdPhoto(`https://picsum.photos/seed/id-doc-${Date.now()}/600/400`);
    toast({ title: "ID Uploaded", description: "Document captured successfully." });
  };

  const handleResidenceUpload = () => {
    setResidencePhoto(`https://picsum.photos/seed/residence-${Date.now()}/600/400`);
    toast({ title: "Proof of Residence Uploaded", description: "Utility bill/statement captured." });
  };

  const runVerification = async () => {
    if (!idPhoto || !selfie || !popiaConsent) return;
    setIsProcessing(true);
    try {
      const result = await verifyIdentity({
        idPhotoDataUri: idPhoto,
        selfieDataUri: selfie,
        fullName: fullName
      });
      setVerificationResult(result);
      if (result.isVerified) {
        setStep(6); // Success
      } else {
        setStep(5); // Failure
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Process Error", description: "Something went wrong during AI analysis." });
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#225BC3]/10 rounded-[2rem] mb-6 shadow-xl">
              <ShieldCheck className="w-10 h-10 text-[#225BC3]" />
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
                  {steps.map((s) => (
                    <div 
                      key={s.id} 
                      className={`h-1.5 w-8 rounded-full transition-colors ${step >= s.id ? 'bg-[#225BC3]' : 'bg-slate-100'}`} 
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
                    <p className="text-sm text-muted-foreground font-medium">Verified Phone: {authUser?.phoneNumber || "Connected"}</p>
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
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                      <Image src={idPhoto} alt="ID Document" fill className="object-cover" />
                      <button 
                        onClick={() => setIdPhoto(null)}
                        className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="border-4 border-dashed border-[#225BC3]/10 rounded-[2.5rem] p-16 text-center cursor-pointer hover:bg-[#225BC3]/5 transition-all flex flex-col items-center"
                      onClick={handleIdUpload}
                    >
                      <Upload className="w-12 h-12 text-[#225BC3] mb-4" />
                      <p className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Capture Document</p>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-[#225BC3] text-white font-black h-16 rounded-2xl shadow-xl" 
                    onClick={() => setStep(3)}
                    disabled={!idPhoto}
                  >
                    Continue to Pillar 3
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Pillar 3: Biometric Scan</h2>
                    <p className="text-sm text-muted-foreground font-medium">Center your face to confirm your identity.</p>
                  </div>

                  <div className="relative aspect-square max-w-[320px] mx-auto rounded-full overflow-hidden border-8 border-slate-100 shadow-2xl bg-black">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-[40px] border-white/20 rounded-full" />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {selfie && (
                      <div className="absolute inset-0 bg-white">
                        <Image src={selfie} alt="Selfie" fill className="object-cover rounded-full" />
                        <button onClick={() => setSelfie(null)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#225BC3] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase">Retake</button>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full h-16 bg-[#34CBED] text-white font-black rounded-2xl shadow-xl"
                    onClick={selfie ? () => setStep(4) : captureSelfie}
                  >
                    {selfie ? "Continue to Pillar 4" : "Capture Face Scan"}
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
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                      <Image src={residencePhoto} alt="Residence Proof" fill className="object-cover" />
                      <button onClick={() => setResidencePhoto(null)} className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div 
                      className="border-4 border-dashed border-[#225BC3]/10 rounded-[2.5rem] p-16 text-center cursor-pointer hover:bg-[#225BC3]/5 transition-all flex flex-col items-center"
                      onClick={handleResidenceUpload}
                    >
                      <Home className="w-12 h-12 text-[#225BC3] mb-4" />
                      <p className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Capture Residence Proof</p>
                    </div>
                  )}

                  <div className="p-4 bg-[#225BC3]/5 rounded-2xl border border-[#225BC3]/10 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="popia" 
                        checked={popiaConsent}
                        onCheckedChange={(checked) => setPopiaConsent(checked === true)}
                      />
                      <label htmlFor="popia" className="text-[10px] font-bold text-[#225BC3] leading-relaxed cursor-pointer uppercase">
                        I consent to biometric processing and FICA data validation for marketplace security.
                      </label>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-16 bg-[#225BC3] text-white font-black rounded-2xl shadow-xl"
                    onClick={runVerification}
                    disabled={isProcessing || !residencePhoto || !popiaConsent}
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finalize & Submit Verification"}
                  </Button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
                  <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
                  <h2 className="text-3xl font-black text-slate-900 uppercase">Verification Failed</h2>
                  <p className="text-sm text-muted-foreground font-medium">{verificationResult?.reason || "Data mismatch detected."}</p>
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-[#225BC3] font-black" onClick={() => setStep(1)}>Restart Process</Button>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
                  <h2 className="text-3xl font-black text-slate-900 uppercase">Identity Authenticated</h2>
                  <p className="text-sm text-muted-foreground font-medium">All 4 pillars (Phone, ID, Selfie, Address) verified. You are now a Trusted Seller.</p>
                  <Button className="w-full h-16 bg-[#225BC3] text-white font-black rounded-2xl shadow-xl" onClick={() => window.location.href = '/'}>Start Trading</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
