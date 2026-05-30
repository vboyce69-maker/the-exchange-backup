"use client";

import { useState, useRef, useEffect } from "react";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Smartphone, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PhoneAuthProps {
  onSuccess: () => void;
  onConsentChange: (agreed: boolean) => void;
  agreedToTerms: boolean;
}

export function PhoneAuth({ onSuccess, agreedToTerms }: PhoneAuthProps) {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
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
    
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
      formattedPhone = '+27' + formattedPhone.substring(1);
    }

    if (!formattedPhone.startsWith('+')) {
      toast({ variant: "destructive", title: "Invalid Format", description: "Include your country code (e.g. +27)." });
      return;
    }

    setLoading(true);

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setStep("otp");
      toast({ title: "OTP Sent", description: `Verification code sent to ${formattedPhone}` });
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      
      let errorMessage = err.message || "An unexpected error occurred.";
      
      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "Domain Unauthorized: Please add the current preview URL to 'Authorized Domains' in the Firebase Console.";
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = "Phone Authentication is not enabled in the Firebase Console (Authentication > Sign-in method).";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "We have sent too many codes to this number. Please try again later.";
      }

      toast({ 
        variant: "destructive", 
        title: "Configuration Notice", 
        description: errorMessage 
      });

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
    try {
      await confirmationResult.confirm(otp);
      onSuccess();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Invalid Code", description: "The code you entered is incorrect." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
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
                className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-black text-lg" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <div id="recaptcha-container"></div>
          <Button className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl" disabled={loading}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify via SMS"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2 text-center">
            <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Verification Code</Label>
            <Input 
              placeholder="000000" 
              className="h-16 rounded-2xl bg-slate-50 border-none font-black text-center text-3xl tracking-[0.5em]" 
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
            />
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Enter the 6-digit code sent to your device</p>
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
            <RefreshCw className="w-3 h-3 mr-2" /> Change Number
          </Button>
        </form>
      )}
    </div>
  );
}
