"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2, ShieldCheck, ArrowRight, Home, AlertCircle, RefreshCw } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { sendEmailVerification, verifyBeforeUpdateEmail, signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    if (!user || !auth) return;
    setIsSending(true);
    try {
      // If user is editing or has no email, we use verifyBeforeUpdateEmail
      // This is required by modern Firebase security settings to prevent "blind" updates
      if (emailInput && emailInput !== user.email) {
        await verifyBeforeUpdateEmail(user, emailInput);
        toast({
          title: "Verification Sent",
          description: `A secure link was sent to ${emailInput}. Your account will update once you confirm the link.`,
        });
      } else {
        // Just resend verification to existing email
        await sendEmailVerification(user);
        toast({
          title: "Link Transmitted",
          description: `Verification link sent to ${user.email}. Please check your inbox and junk folder.`,
        });
      }
      
      setCountdown(60); // Prevent spamming for 1 minute
      setIsEditing(false);
    } catch (err: any) {
      console.error("Email Verification Error:", err);
      let errorMessage = "We could not send the verification email. Please try again.";
      
      if (err.code === 'auth/requires-recent-login') {
        errorMessage = "For security, this action requires a recent login. Please sign out and sign back in to continue.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "The provided email address is not valid.";
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already linked to another account.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "System busy. Please wait a few moments before trying again.";
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "Domain Unauthorized: Please add the current preview URL to the 'Authorized Domains' list in the Firebase Console.";
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = "Verification-first updates are required. Please ensure the email link provider is active in the console.";
      }

      toast({
        variant: "destructive",
        title: "Verification Error",
        description: errorMessage,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-[#225BC3] mb-4" />
          <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Checking Authentication...</p>
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
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Email Verification</h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Pillar 1: Identity Activation</p>
            </CardHeader>
            <CardContent className="px-10 pb-10 text-center space-y-6">
              
              {user.emailVerified ? (
                <div className="space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center justify-center gap-2 text-green-600 font-black uppercase text-sm">
                    <CheckCircle2 className="w-6 h-6" /> Pillar Verified
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Your email is confirmed. You can now proceed to complete your full biometric KYC.</p>
                  <Button className="w-full h-14 rounded-2xl bg-[#225BC3] text-white font-black shadow-xl" onClick={() => router.push('/verify')}>
                    Proceed to Identity Hub <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 text-left">
                    {!user.email && !isEditing && (
                      <Alert className="bg-orange-50 border-orange-200 rounded-2xl border">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertTitle className="font-black text-[10px] uppercase tracking-widest text-orange-800">Email Required</AlertTitle>
                        <AlertDescription className="text-xs font-bold text-orange-700 leading-tight">
                          Phone signups must register an email to receive legal trade confirmations and secure account links.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Verification Target</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="email" 
                          placeholder="name@example.co.za" 
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          disabled={isSending || (!isEditing && !!user.email)}
                          className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-inner"
                        />
                        {!!user.email && !isEditing && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-14 w-14 rounded-2xl border-slate-100 bg-white shadow-sm" 
                            onClick={() => setIsEditing(true)}
                          >
                            <RefreshCw className="w-4 h-4 text-slate-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100">
                    <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                      {isEditing || !user.email 
                        ? "Enter your primary email address. We will send a secure link to confirm ownership."
                        : `A link will be sent to ${user.email}. If you don't see it within 2 minutes, please check your spam folder.`}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50" 
                      onClick={handleSendVerification}
                      disabled={isSending || !emailInput || countdown > 0}
                    >
                      {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                       countdown > 0 ? `Resend in ${countdown}s` :
                       (isEditing || !user.email ? "Set Email & Verify" : "Send Verification Link")}
                    </Button>
                    
                    <div className="flex flex-col gap-2 pt-2">
                      <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-slate-400 tracking-widest" onClick={() => router.push('/')}>
                        <Home className="w-3 h-3 mr-2" /> Return to Home
                      </Button>
                      <button 
                        onClick={handleSignOut}
                        className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors"
                      >
                        Sign out and try different account
                      </button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-4">
             <ShieldCheck className="w-8 h-8 text-[#225BC3] shrink-0" />
             <div>
                <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Compliance Protocol</p>
                <p className="text-[9px] text-blue-600 font-bold leading-relaxed mt-1">
                  Per the RSA Consumer Protection Act, valid email verification is required to generate digital trade logs for every transaction made on 'The Exchange'.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
