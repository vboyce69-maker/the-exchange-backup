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
import { auth } from "@/firebase";
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
  ArrowRight, 
  ShieldCheck,
  Eye,
  EyeOff 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Email Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

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
      toast({ title: "Welcome Back", description: "Authentication successful." });
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
            <Alert variant="destructive" className="rounded-2xl border-none shadow-lg animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-black text-[10px] uppercase tracking-widest">Auth Error</AlertTitle>
              <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-[#225BC3]/5">
            <CardHeader className="p-10 text-center pb-6">
               <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter leading-none">THE <span className="text-[#34CBED]">EXCHANGE</span></h1>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-3 opacity-60">Join South Africa's Trusted Marketplace</p>
            </CardHeader>

            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="flex bg-slate-50 mx-10 rounded-2xl p-1 mb-6">
                <TabsTrigger value="phone" className="flex-1 rounded-xl py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Phone</TabsTrigger>
                <TabsTrigger value="email" className="flex-1 rounded-xl py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Email</TabsTrigger>
              </TabsList>

              <CardContent className="px-10 pb-10">
                <TabsContent value="phone" className="mt-0 outline-none">
                  {step === "phone" ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                          <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Mobile Number</Label>
                          <span className="text-[8px] font-bold text-slate-400">RSA: +27...</span>
                        </div>
                        <div className="relative group">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#225BC3] transition-colors" />
                          <Input 
                            placeholder="082 000 0000" 
                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-black text-lg focus:ring-4 focus:ring-[#225BC3]/5 transition-all" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <div id="recaptcha-container"></div>
                      <Button className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify via SMS"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <div className="space-y-2 text-center">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Verification Code</Label>
                        <Input 
                          placeholder="000000" 
                          className="h-16 rounded-2xl bg-slate-50 border-none font-black text-center text-3xl tracking-[0.5em] focus:ring-4 focus:ring-[#34CBED]/5 transition-all" 
                          value={otp}
                          maxLength={6}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Enter the 6-digit code sent to your device</p>
                      </div>
                      <Button className="w-full h-16 rounded-2xl bg-[#34CBED] text-white font-black text-lg shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Code"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-[#225BC3]"
                        onClick={() => setStep("phone")}
                      >
                        Change Phone Number
                      </Button>
                    </form>
                  )}
                </TabsContent>

                <TabsContent value="email" className="mt-0 outline-none">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3] ml-2">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#225BC3] transition-colors" />
                        <Input 
                          type="email"
                          placeholder="name@example.co.za" 
                          className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold focus:ring-4 focus:ring-[#225BC3]/5 transition-all" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3] ml-2">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#225BC3] transition-colors" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          className="h-14 pl-12 pr-12 rounded-2xl bg-slate-50 border-none font-bold focus:ring-4 focus:ring-[#225BC3]/5 transition-all" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#225BC3] transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4" disabled={loading}>
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? "Create Account" : "Secure Login")}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-[#225BC3] mt-2"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? "Already have an account? Login" : "New here? Join The Exchange"}
                    </Button>
                  </form>
                </TabsContent>

                <div className="mt-8 flex items-start space-x-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms} 
                    onCheckedChange={(c) => setAgreedToTerms(c === true)} 
                    className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#225BC3] data-[state=checked]:border-[#225BC3]"
                  />
                  <label htmlFor="terms" className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">
                    I agree to the <Link href="/legal" className="text-[#225BC3] underline">Terms of Service</Link> and understand my data will be handled per the <Link href="/legal" className="text-[#225BC3] underline">Privacy Policy</Link> (POPIA Compliant).
                  </label>
                </div>
              </CardContent>
            </Tabs>
          </Card>

          <div className="p-6 bg-[#225BC3]/5 rounded-[2rem] border border-[#225BC3]/10 flex gap-4">
             <div className="bg-white p-2 rounded-xl shadow-sm h-fit">
                <ShieldCheck className="w-6 h-6 text-[#225BC3]" />
             </div>
             <div>
                <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest mb-1">Sybil-Attack Prevention</p>
                <p className="text-[9px] text-blue-600/80 font-bold leading-relaxed">
                  We use phone-based OTP verification to ensure every user on the platform is a verified resident, effectively eliminating anonymous fraud syndicates.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
