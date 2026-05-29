"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle2, ShieldCheck, ArrowRight, Home } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: "Verification Sent",
        description: "Check your inbox for the link.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Could not send verification email.",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navigation />
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="max-w-md w-full space-y-6">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-[#225BC3]/5">
            <CardHeader className="p-10 text-center pb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Mail className="w-10 h-10 text-[#225BC3]" />
              </div>
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Verify Email</h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Pillar 1: Identity Activation</p>
            </CardHeader>
            <CardContent className="px-10 pb-10 text-center space-y-6">
              {user.emailVerified ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600 font-black uppercase text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Already Verified
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-[#225BC3] text-white font-black shadow-xl" onClick={() => router.push('/verify')}>
                    Proceed to Identity KYC <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    We've sent a verification link to <span className="font-black text-slate-900">{user.email}</span>. Please click the link in that email to activate your account.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl hover:scale-[1.02] transition-transform" 
                      onClick={handleResend}
                      disabled={isSending}
                    >
                      {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Resend Verification Link"}
                    </Button>
                    <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-slate-400" onClick={() => router.push('/')}>
                      <Home className="w-3 h-3 mr-2" /> Return to Home
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-4">
             <ShieldCheck className="w-8 h-8 text-[#225BC3] shrink-0" />
             <div>
                <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Why verify email?</p>
                <p className="text-[9px] text-blue-600 font-bold leading-relaxed mt-1">
                  Email verification is required by South African Consumer Protection regulations to ensure secure trade logs and payment confirmation delivery.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
