
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import { useAuth } from "@/firebase";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Smartphone, Lock, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha verified");
        },
      });
    }
  }, [auth]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.startsWith("+")) {
      toast({
        variant: "destructive",
        title: "Invalid Format",
        description: "Please include country code (e.g., +27123456789).",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: `A code has been sent to ${phoneNumber}.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send OTP.",
      });
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
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      router.push("/");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "The code you entered is incorrect.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-md rounded-[3rem] border-none shadow-2xl bg-white ring-1 ring-[#225BC3]/5">
          <CardHeader className="p-10 text-center">
            <div className="w-20 h-20 bg-[#225BC3]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              {step === "phone" ? (
                <Smartphone className="w-10 h-10 text-[#225BC3]" />
              ) : (
                <Lock className="w-10 h-10 text-[#34CBED]" />
              )}
            </div>
            <CardTitle className="text-3xl font-black text-[#225BC3] tracking-tighter uppercase">
              {step === "phone" ? "Verify Phone" : "Enter Code"}
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground mt-2">
              {step === "phone" 
                ? "We'll send you a one-time password to secure your account."
                : `Enter the 6-digit code sent to ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="p-10 pt-0">
            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+27 12 345 6789" 
                    required 
                    className="h-16 rounded-2xl bg-slate-50 border-none font-black text-lg text-center"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div id="recaptcha-container"></div>
                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl hover:scale-[1.02] transition-transform"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Verification Code</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="000000" 
                    maxLength={6}
                    required 
                    className="h-16 rounded-2xl bg-slate-50 border-none font-black text-2xl tracking-[1em] text-center pl-[1em]"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-2xl bg-[#34CBED] text-white font-black text-lg shadow-xl hover:scale-[1.02] transition-transform"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Continue"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full font-bold text-xs text-[#225BC3]" 
                  onClick={() => setStep("phone")}
                >
                  Change Number
                </Button>
              </form>
            )}
            
            <div className="mt-10 p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-[#225BC3] shrink-0" />
              <p className="text-[10px] text-blue-700 font-bold leading-tight uppercase tracking-wider">
                Phone verification ensures a trusted local community and protects against bot accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
