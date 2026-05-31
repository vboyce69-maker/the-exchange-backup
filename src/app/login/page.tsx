"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PhoneAuth } from "@/components/auth/PhoneAuth";
import { MARKET_CONFIG } from "@/app/lib/market-config";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/";
  const referralCode = searchParams.get("ref");

  const ensureUserProfile = async (user: User) => {
    if (!db) return;
    const profileRef = doc(db, "userProfiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        id: user.uid,
        username: email.split("@")[0] || `trader_${user.uid.substring(0, 5)}`,
        registrationDate: new Date().toISOString(),
        kycStatus: "unverified",
        isIdVerified: false,
        reliabilityScore: MARKET_CONFIG.BASE_TRUST_SCORE,
        transactionsCompleted: 0,
        disputeCount: 0,
        referredBy: referralCode || null,
        lastLogin: new Date().toISOString(),
      });

      // Handle Referral Tracking
      if (referralCode) {
        // Find the referrer by code
        const refQ = doc(db, "referrals", referralCode);
        // Note: For actual production, searching by referralCode field is better
        // but for this prototype we assume ID = Code
        await updateDoc(doc(db, "referrals", referralCode), {
          invites: arrayUnion({
            userId: user.uid,
            date: new Date().toISOString(),
          }),
          credits: arrayUnion({ amount: 50, source: "referral_bonus" }),
        }).catch(() =>
          console.warn("Referrer document not found for reward award."),
        );
      }
    } else {
      await updateDoc(profileRef, { lastLogin: new Date().toISOString() });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast({
        variant: "destructive",
        title: "Consent Required",
        description: "Agreement to marketplace terms is mandatory.",
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await ensureUserProfile(userCred.user);
        await sendEmailVerification(userCred.user);
        toast({
          title: "Account Initialized",
          description: "Verify your email to enter the market.",
        });
        router.push("/verify-email");
      } else {
        const userCred = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await ensureUserProfile(userCred.user);
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    if (auth.currentUser) {
      await ensureUserProfile(auth.currentUser);
    }
    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen bg-[#EEF1F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="rounded-2xl border-none shadow-lg"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-black text-[10px] uppercase">
                Auth Sync Error
              </AlertTitle>
              <AlertDescription className="text-xs font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="p-10 text-center pb-6">
              <h1 className="text-3xl font-black text-[#225BC3] uppercase tracking-tighter leading-none">
                THE <span className="text-[#34CBED]">EXCHANGE</span>
              </h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-3">
                Persistent Marketplace Identity
              </p>
              {referralCode && (
                <Badge className="mt-4 bg-pink-100 text-pink-700 border-none px-4 py-1 uppercase text-[8px] font-black">
                  Joining via Referral
                </Badge>
              )}
            </CardHeader>

            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="flex bg-slate-50 mx-10 rounded-2xl p-1 mb-6">
                <TabsTrigger
                  value="phone"
                  className="flex-1 rounded-xl py-2 font-black uppercase text-[10px]"
                >
                  Phone
                </TabsTrigger>
                <TabsTrigger
                  value="email"
                  className="flex-1 rounded-xl py-2 font-black uppercase text-[10px]"
                >
                  Email
                </TabsTrigger>
              </TabsList>

              <CardContent className="px-10 pb-10">
                <TabsContent value="phone" className="mt-0 outline-none">
                  <PhoneAuth
                    agreedToTerms={agreedToTerms}
                    onConsentChange={setAgreedToTerms}
                    onSuccess={handleAuthSuccess}
                  />
                </TabsContent>

                <TabsContent value="email" className="mt-0 outline-none">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <Input
                          type="email"
                          placeholder="name@domain.co.za"
                          className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase text-[#225BC3]">
                        Secure Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-slate-300" />
                          ) : (
                            <Eye className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      className="w-full h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : isSignUp ? (
                        "Create Identity"
                      ) : (
                        "Authorize Session"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-[10px] font-black uppercase text-slate-400"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp
                        ? "Account exists? Login"
                        : "Join the Verified Market"}
                    </Button>
                  </form>
                </TabsContent>

                <div className="mt-8 flex items-start space-x-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(c) => setAgreedToTerms(c === true)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase"
                  >
                    I agree to the Terms of Service. My data will be processed
                    according to South African POPIA regulations.
                  </label>
                </div>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
}
