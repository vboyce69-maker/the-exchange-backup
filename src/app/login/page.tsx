"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { auth, db } from "@/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
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
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PhoneAuth } from "@/components/auth/PhoneAuth";
import { MARKET_CONFIG } from "@/app/lib/market-config";

function LoginPageContent() {
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
      // Create new profile with robust defaults for persistence
      const newProfile = {
        id: user.uid,
        username: user.email?.split("@")[0] || user.phoneNumber || `trader_${user.uid.substring(0, 5)}`,
        registrationDate: new Date().toISOString(),
        kycStatus: "unverified",
        isIdVerified: false,
        reliabilityScore: MARKET_CONFIG.BASE_TRUST_SCORE,
        trustScore: MARKET_CONFIG.BASE_TRUST_SCORE,
        transactionsCompleted: 0,
        disputeCount: 0,
        referredBy: referralCode || null,
        lastLogin: new Date().toISOString(),
        profileImageUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        phoneNumber: user.phoneNumber || null,
        email: user.email || null,
      };
      
      await setDoc(profileRef, newProfile);

      // Handle Referral Tracking by Code
      if (referralCode) {
        try {
          const referralsRef = collection(db, "referrals");
          const q = query(referralsRef, where("referralCode", "==", referralCode));
          const querySnap = await getDocs(q);
          
          if (!querySnap.empty) {
            toast({
              title: "Referral Applied",
              description: "Invite perks will activate after your first trade.",
            });
          }
        } catch (err) {
          console.warn("Referral tracking error:", err);
        }
      }
    } else {
      // Sync existing profile with session metadata
      const existingData = profileSnap.data();
      await updateDoc(profileRef, { 
        lastLogin: new Date().toISOString(),
        profileImageUrl: user.photoURL || existingData.profileImageUrl || `https://picsum.photos/seed/${user.uid}/200/200`,
        phoneNumber: user.phoneNumber || existingData.phoneNumber,
        email: user.email || existingData.email,
      });
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
          title: "Identity Created",
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
            <CardHeader className="p-10 text-center pb-6 space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  THE EXCHANGE
                </h1>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">
                  Persistent Marketplace Identity
                </p>
              </div>
              {referralCode && (
                <Badge className="bg-pink-100 text-pink-700 border-none px-4 py-1 uppercase text-[8px] font-black">
                  Referral Active
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
                        "Create Account"
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-[10px] font-black uppercase text-slate-400"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp
                        ? "Already have an account? Login"
                        : "Join the Marketplace"}
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
                    I agree to the Terms of Service. My identity and trade logs will be secured per South African POPIA laws.
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EEF1F3] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
