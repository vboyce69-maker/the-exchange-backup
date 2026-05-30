"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User
} from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  EyeOff 
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

  // Email Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const redirectPath = searchParams.get('redirect') || '/';

  const ensureUserProfile = async (user: User) => {
    const profileRef = doc(db, "userProfiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      // Initialize base profile for new user
      await setDoc(profileRef, {
        id: user.uid,
        firstName: "",
        lastName: "",
        username: email.split('@')[0] || `user_${user.uid.substring(0, 5)}`,
        bio: "New member of The Exchange community.",
        registrationDate: new Date().toISOString(),
        isIdVerified: false,
        kycStatus: 'unverified',
        reliabilityScore: MARKET_CONFIG.BASE_TRUST_SCORE,
        transactionsCompleted: 0,
        disputeCount: 0,
        isFoundingMember: true, // Auto-assign for early adopters
        profileImageUrl: `https://picsum.photos/seed/${user.uid}/200/200`
      });
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
        await ensureUserProfile(userCred.user);
        await sendEmailVerification(userCred.user);
        toast({ title: "Account Created", description: "Verification link sent to your email." });
        router.push("/verify-email");
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
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
    toast({ title: "Welcome Back", description: "Authentication successful." });
    router.push(redirectPath);
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
                  <PhoneAuth 
                    agreedToTerms={agreedToTerms}
                    onConsentChange={setAgreedToTerms}
                    onSuccess={handleAuthSuccess}
                  />
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
                          className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold" 
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
                          className="h-14 pl-12 pr-12 rounded-2xl bg-slate-50 border-none font-bold" 
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
        </div>
      </main>
    </div>
  );
}
