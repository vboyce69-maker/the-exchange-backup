"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { useAuth } from "@/firebase";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Mail, 
  Lock, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  ShieldCheck,
  Eye,
  EyeOff 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast({ variant: "destructive", title: "Consent Required", description: "Please agree to the Terms of Service." });
      return;
    }
    
    // Auto-prefix for South African users if they forget the +27
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
      formattedPhone = '+27' + formattedPhone.substring(1);
      setPhoneNumber(formattedPhone);
    }

    if (!formattedPhone.startsWith('+')) {
      setError("Please include your country code (e.g. +27 for RSA).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const container = document.getElementById("recaptcha-container");
      if (!container) {
        throw new Error("Security container not ready. Please refresh.");
      }

      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => { console.log("Recaptcha verified"); }
        });
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setStep("otp");
      toast({ title: "OTP Sent", description: `Verification code sent to ${formattedPhone}` });
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      setError(err.message || "Failed to send OTP. Check if Phone Auth is enabled in Firebase Console.");
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      router.push("/");
    } catch (err: any) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast({ variant: "destructive", title: "Consent Required", description: "Please agree to the Terms of Service." });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCred.user);
        toast({ title: "Account Created", description: "Verification link sent to your email." });
        router.push("/verify-email");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md space-y-6">
          
          {error && (
            <Alert variant="destructive" className="rounded-2xl border-none shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-black text-[10px] uppercase tracking-widest">Auth Error</AlertTitle>
              <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-[#225BC3]/5">
            <CardHeader className="p-10 text-center pb-6">
               <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Get Started</h1>
               <p className="text-slate-500 font-bold text-xs mt-2">Join South Africa's most trusted marketplace.</p>
            </CardHeader>

            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="flex bg-slate-50 mx-10 rounded-2xl p-1 mb-6">
                <TabsTrigger value="phone" className="flex-1 rounded-xl py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Phone</TabsTrigger>
                <TabsTrigger value="email" className="flex-1 rounded-xl py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Email</TabsTrigger>
              </TabsList>

              <CardContent className="px-10 pb-10">
                <TabsContent value="phone" className="mt-0">
                  {step === "phone" ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                          <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Mobile Number</Label>
                          <span className="text-[8px] font-bold text-slate-400">RSA Format: +27...</span>
                        </div>
                        <Input 
                          placeholder="+27 61 430 4746" 
                          className="h-14 rounded-2xl bg-slate-50 border-none font-black text-center text-lg" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      <div id="recaptcha-container"></div>
                      <Button className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl" disabled={loading}>
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify via SMS"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Verification Code</Label>
                        <Input 
                          placeholder="000000" 
                          className="h-14 rounded-2xl bg-slate-50 border-none font-black text-center text-2xl tracking-[0.5em]" 
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </div>
                      <Button className="w-full h-16 rounded-2xl bg-[#34CBED] text-white font-black text-lg shadow-xl" disabled={loading}>
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Code"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full text-[10px] font-black uppercase text-slate-400"
                        onClick={() => setStep("phone")}
                      >
                        Change Phone Number
                      </Button>
                    </form>
                  )}
                </TabsContent>

                <TabsContent value="email" className="mt-0">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Email Address</Label>
                      <Input 
                        type="email"
                        placeholder="name@example.co.za" 
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Password</Label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          className="h-14 rounded-2xl bg-slate-50 border-none font-bold pr-12" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#225BC3] transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl" disabled={loading}>
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? "Create Account" : "Login")}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full text-[10px] font-black uppercase text-slate-400"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
                    </Button>
                  </form>
                </TabsContent>

                <div className="mt-8 flex items-start space-x-3">
                  <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(c) => setAgreedToTerms(c === true)} />
                  <label htmlFor="terms" className="text-[9px] font-bold text-slate-500 leading-tight">
                    I agree to the <Link href="/legal" className="text-[#225BC3] underline">Terms of Service</Link> and understand my data will be handled per the <Link href="/legal" className="text-[#225BC3] underline">Privacy Policy</Link>.
                  </label>
                </div>
              </CardContent>
            </Tabs>
          </Card>

          <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-4">
             <ShieldCheck className="w-8 h-8 text-[#225BC3] shrink-0" />
             <div>
                <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Multi-Layer Security</p>
                <p className="text-[9px] text-blue-600 font-bold leading-relaxed mt-1">
                  We verify both phone and email to prevent sybil attacks and ensure all sellers are reachable for physical trades.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
