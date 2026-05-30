
"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2, ShieldCheck, ArrowRight, Home, AlertCircle, RefreshCw, LogOut, Info, ExternalLink } from "lucide-react";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { sendEmailVerification, verifyBeforeUpdateEmail, signOut, reload } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Sync state with user data
  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    }
  }, [user]);

  // Handle countdown for resending
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-refresh when window gains focus (user returns from email client)
  useEffect(() => {
    const handleFocus = () => {
      if (user && !user.emailVerified) {
        handleRefreshStatus();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleRefreshStatus = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      await reload(user);
      if (user.emailVerified) {
        if (db) {
          const profileRef = doc(db, "userProfiles", user.uid);
          await updateDoc(profileRef, { kycPillar1: 'verified' }).catch(() => {});
        }
        toast({ title: "Identity Pillar Activated", description: "Email verification sync complete." });
        router.push('/');
      } else {
        // No toast here to keep focus/auto-refresh silent unless manual
      }
    } catch (err) {
      console.error("Status Sync Error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendVerification = async () => {
    if (!user || !auth) return;
    setIsSending(true);
    
    try {
      if (emailInput && emailInput !== user.email) {
        // Case: Setting for the first time or updating
        await verifyBeforeUpdateEmail(user, emailInput);
        toast({
          title: "Secure Link Transmitted",
          description: `A verification link has been sent to ${emailInput}.`,
        });
      } else if (user.email) {
        // Case: Resending to current email
        await sendEmailVerification(user);
        toast({
          title: "Link Resent",
          description: `Check your inbox (${user.email}) for the new link.`,
        });
      } else {
        throw new Error("No email address provided.");
      }
      
      setCountdown(60);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Verification Trigger Failure:", err);
      let errorMessage = "Verification delivery failed. Please try again.";
      
      if (err.code === 'auth/requires-recent-login') {
        errorMessage = "Security policy requires a recent login. Please sign out and back in.";
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "Domain Unauthorized: Add this domain to Authorized Domains in Firebase Console.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "System throttled: Too many emails sent. Please wait a few minutes.";
      }

      toast({ variant: "destructive", title: "Protocol Error", description: errorMessage });
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
          <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest text-center">Syncing Security Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter">Account Activation</h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Pillar 1: Email Verification</p>
            </CardHeader>
            <CardContent className="px-10 pb-10 text-center space-y-6">
              
              {user.emailVerified ? (
                <div className="space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center justify-center gap-2 text-green-600 font-black uppercase text-sm">
                    <CheckCircle2 className="w-6 h-6" /> Pillar Verified
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Your identity is confirmed. The marketplace is now fully unlocked.</p>
                  <Button className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black shadow-xl text-lg" onClick={() => router.push('/')}>
                    Enter Marketplace <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 text-left">
                    {!user.email && !isEditing && (
                      <Alert className="bg-orange-50 border-orange-200 rounded-2xl border">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertTitle className="font-black text-[10px] uppercase tracking-widest text-orange-800">Registration Incomplete</AlertTitle>
                        <AlertDescription className="text-xs font-bold text-orange-700 leading-tight">
                          Phone-only users must register an email to enable trade protection.
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

                  <div className="space-y-3">
                    <Button 
                      className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50" 
                      onClick={handleSendVerification}
                      disabled={isSending || !emailInput || countdown > 0}
                    >
                      {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                       countdown > 0 ? `Retry in ${countdown}s` :
                       (isEditing || !user.email ? "Secure Email & Verify" : "Resend Link")}
                    </Button>

                    <Button 
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-slate-100 font-black text-slate-600 gap-2 uppercase text-[10px] tracking-widest"
                      onClick={() => { handleRefreshStatus(); if (!user.emailVerified) toast({ title: "Checking...", description: "Identity sync in progress." }); }}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Sync Status
                    </Button>
                  </div>

                  <Accordion type="single" collapsible className="w-full text-left">
                    <AccordionItem value="troubleshooting" className="border-none">
                      <AccordionTrigger className="text-[10px] font-black uppercase text-slate-400 py-2 hover:no-underline hover:text-[#225BC3] transition-colors">
                        <Info className="w-3 h-3 mr-2" /> Help: Link not arriving?
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-700">1. Check Spam/Junk</p>
                           <p className="text-[9px] text-slate-500">Automated links are often filtered. Look for "The Exchange Identity".</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-700">2. Verify Domain Authorization</p>
                           <p className="text-[9px] text-slate-500 leading-relaxed">
                             Developers: Ensure the current domain is in the <span className="font-mono bg-white px-1">Authorized domains</span> list in the Firebase Console.
                           </p>
                           <Button variant="link" className="p-0 h-auto text-[9px] font-black text-[#225BC3] uppercase" asChild>
                              <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                                Open Console <ExternalLink className="w-2.5 h-2.5 ml-1" />
                              </a>
                           </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-slate-400 tracking-widest" onClick={() => router.push('/')}>
                      <Home className="w-3 h-3 mr-2" /> Enter as Guest
                    </Button>
                    <button 
                      onClick={handleSignOut}
                      className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3 h-3" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex gap-4">
             <ShieldCheck className="w-8 h-8 text-[#225BC3] shrink-0" />
             <div>
                <p className="text-[10px] font-black text-[#225BC3] uppercase tracking-widest">Platform Integrity</p>
                <p className="text-[9px] text-blue-600 font-bold leading-relaxed mt-1">
                  Once verified, your marketplace identity is permanent. This activation persists across all devices and sessions.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
