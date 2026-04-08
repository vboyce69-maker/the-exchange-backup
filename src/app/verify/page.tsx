
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
  AlertCircle, 
  Loader2, 
  Camera, 
  ScanFace,
  RefreshCw,
  UserCheck,
  XCircle,
  Eye,
  Lock
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { verifyIdentity, VerifyIdentityOutput } from "@/ai/flows/verify-identity-flow";

export default function VerificationPage() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerifyIdentityOutput | null>(null);
  const [popiaConsent, setPopiaConsent] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");

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
    setIdPhoto(`https://picsum.photos/seed/id-doc/600/400`);
    toast({ title: "ID Uploaded", description: "Document captured successfully." });
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
        setStep(5);
      } else {
        setStep(4);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Process Error", description: "Something went wrong during AI analysis." });
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#225BC3]/10 rounded-[2rem] mb-6">
              <ScanFace className="w-10 h-10 text-[#225BC3]" />
            </div>
            <h1 className="text-4xl font-black text-[#225BC3] tracking-tighter">Biometric KYC</h1>
            <p className="text-muted-foreground font-medium mt-2">Verify your identity with secure facial recognition.</p>
          </div>

          <Card className="rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="p-8 pb-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {step > 4 ? 4 : step} of 4</span>
                <span className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">{Math.min(100, Math.round((step / 4) * 100))}% Complete</span>
              </div>
              <Progress value={(step / 4) * 100} className="h-2 bg-slate-100" />
            </CardHeader>

            <CardContent className="p-8 pt-10">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Personal Details</h2>
                    <p className="text-sm text-muted-foreground font-medium">This info must match your government ID exactly.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Full Legal Name</Label>
                      <Input 
                        id="fullname" 
                        placeholder="Johnathan Doe" 
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="id-number" className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">ID / Passport Number</Label>
                      <Input 
                        id="id-number" 
                        placeholder="XXXX-XXXX-XXXX" 
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#225BC3] hover:bg-[#225BC3]/90 text-white font-black h-16 rounded-2xl shadow-xl" 
                    onClick={() => setStep(2)}
                    disabled={!fullName || !idNumber}
                  >
                    Continue to Document Upload
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Upload ID Document</h2>
                    <p className="text-sm text-muted-foreground font-medium">A clear photo of your ID card, license, or passport.</p>
                  </div>
                  
                  {idPhoto ? (
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                      <Image src={idPhoto} alt="ID Document" fill className="object-cover" />
                      <button 
                        onClick={() => setIdPhoto(null)}
                        className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="border-4 border-dashed border-[#225BC3]/10 rounded-[2.5rem] p-16 text-center cursor-pointer hover:bg-[#225BC3]/5 hover:border-[#225BC3]/30 transition-all flex flex-col items-center"
                      onClick={handleIdUpload}
                    >
                      <div className="w-16 h-16 bg-[#225BC3]/10 rounded-2xl flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-[#225BC3]" />
                      </div>
                      <p className="font-black text-[#225BC3] uppercase text-xs tracking-widest">Capture ID Document</p>
                      <p className="text-[10px] text-muted-foreground mt-2 font-bold">Front side of document, clear & readable.</p>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-[#225BC3] text-white font-black h-16 rounded-2xl shadow-xl" 
                    onClick={() => setStep(3)}
                    disabled={!idPhoto}
                  >
                    Proceed to Face Scan
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Face Scan</h2>
                    <p className="text-sm text-muted-foreground font-medium">Position your face inside the circle for a biometric check.</p>
                  </div>

                  <div className="relative aspect-square max-w-[320px] mx-auto rounded-full overflow-hidden border-8 border-slate-100 shadow-2xl bg-black group">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
                    <div className="absolute inset-0 border-[40px] border-white/40 rounded-full pointer-events-none" />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {selfie && (
                      <div className="absolute inset-0 bg-white p-2">
                        <Image src={selfie} alt="Selfie capture" fill className="object-cover rounded-full" />
                        <button 
                          onClick={() => setSelfie(null)}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#225BC3] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl"
                        >
                          Retake
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-[#225BC3]/5 rounded-2xl border border-[#225BC3]/10 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="popia" 
                        className="mt-1" 
                        checked={popiaConsent}
                        onCheckedChange={(checked) => setPopiaConsent(checked === true)}
                      />
                      <label htmlFor="popia" className="text-[10px] font-bold text-[#225BC3] leading-relaxed cursor-pointer">
                        POPIA CONSENT: I hereby consent to the processing of my biometric data and ID information for the sole purpose of identity verification on The Exchange. I understand this data is encrypted and handled in accordance with the Protection of Personal Information Act (2013).
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {!selfie ? (
                      <Button 
                        className="w-full h-16 bg-[#34CBED] hover:bg-[#34CBED]/90 text-white font-black rounded-2xl shadow-xl"
                        onClick={captureSelfie}
                        disabled={hasCameraPermission === false || !popiaConsent}
                      >
                        <Camera className="w-5 h-5 mr-2" /> Capture Biometrics
                      </Button>
                    ) : (
                      <Button 
                        className="w-full h-16 bg-[#225BC3] text-white font-black rounded-2xl shadow-xl"
                        onClick={runVerification}
                        disabled={isProcessing || !popiaConsent}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UserCheck className="w-5 h-5 mr-2" />
                        )}
                        {isProcessing ? "AI Analyzing Identity..." : "Submit Verification"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-[2rem] mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Verification Failed</h2>
                  <p className="text-sm text-muted-foreground font-medium px-4">
                    {verificationResult?.reason || "Our AI could not verify your identity. Please ensure clear lighting and that your face matches your ID."}
                  </p>
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-[#225BC3]" onClick={() => setStep(1)}>Retry Process</Button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-[2rem] mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Verification Complete</h2>
                  <p className="text-sm text-muted-foreground font-medium px-4">
                    Your identity has been authenticated. You now carry the "Verified Person" badge and your reliability score has increased.
                  </p>
                  <Button className="w-full h-16 bg-[#225BC3] text-white font-black rounded-2xl shadow-xl" onClick={() => window.location.href = '/'}>Return to The Exchange</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
             <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest"><Lock className="w-3 h-3" /> POPIA Compliant</div>
             <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest"><Eye className="w-3 h-3" /> Encrypted Storage</div>
          </div>
        </div>
      </main>
    </div>
  );
}
