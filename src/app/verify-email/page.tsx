"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2, ShieldCheck, ArrowRight, Home, AlertCircle, RefreshCw } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { sendEmailVerification, updateEmail } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    }
  }, [user]);

  const handleSendVerification = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      // If user is editing or has no email, update it first
      if (emailInput && emailInput !== user.email) {
        await updateEmail(user, emailInput);
      }
      
      await sendEmailVerification(user);
      toast({
        title: "Verification Sent",
        description: `Check ${emailInput || user.email} for the link.`,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error("Email Verification Error:", err);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: err.message || "Could not send verification email. Try logging in again.",
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
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Email Pillar</h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Identity Activation & Security</p>
            </CardHeader>
            <CardContent className="px-10 pb-10 text-center space-y-6">
              {user.emailVerified ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600 font-black uppercase text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Pillar Verified
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-[#225BC3] text-white font-black shadow-xl" onClick={() => router.push('/verify')}>
                    Proceed to Identity KYC <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 text-left">
                    {!user.email && (
                      <Alert className="bg-orange-50 border-orange-100 rounded-2xl">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-[10px] font-bold text-orange-800 uppercase">
                          No email associated with account. Enter one below.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Verification Destination</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="email" 
                          placeholder="name@example.co.za" 
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          disabled={isSending || (!isEditing && !!user.email)}
                          className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                        />
                        {!!user.email && !isEditing && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-14 w-14 rounded-2xl bg-slate-100" 
                            onClick={() => setIsEditing(true)}
                          >
                            <RefreshCw className="w-4 h-4 text-slate-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {isEditing || !user.email 
                      ? "Enter your primary email address to receive the secure activation link."
                      : "We will send a verification link to the address above. Click it to confirm your identity."}
                  </p>

                  <div className="space-y-3">
                    <Button 
                      className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl hover:scale-[1.02] transition-transform" 
                      onClick={handleSendVerification}
                      disabled={isSending || !emailInput}
                    >
                      {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : (isEditing || !user.email ? "Update & Send Link" : "Send Verification Link")}
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
                <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Regulatory Requirement</p>
                <p className="text-[9px] text-blue-600 font-bold leading-relaxed mt-1">
                  Email verification is required by South African Consumer Protection regulations to ensure secure trade logs and delivery of legal payment confirmations.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
