"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useUser, useFirestore, useDoc, useMemoFirebase, useStorage } from "@/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { 
  Settings, 
  ShieldCheck, 
  Camera, 
  Loader2, 
  Save, 
  Mail,
  Smartphone,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STABLE MEMOIZATION FIX: Prevents infinite Firestore subscription loops
  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, "userProfiles", user.uid) : null;
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setBio(profile.bio || "");
      setLocationName(profile.locationName || "");
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profile_pics/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Auth Profile
      await updateProfile(user, { photoURL: downloadURL });

      // Update Firestore Profile
      const userRef = doc(db, "userProfiles", user.uid);
      await updateDoc(userRef, { profileImageUrl: downloadURL });

      toast({ title: "Avatar Updated", description: "Your new profile picture is live." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const data = {
        firstName,
        lastName,
        bio,
        locationName,
        updatedAt: new Date().toISOString()
      };

      if (!profile) {
        await setDoc(doc(db, "userProfiles", user.uid), {
          ...data,
          id: user.uid,
          registrationDate: new Date().toISOString(),
          isIdVerified: false,
          reliabilityScore: 50,
          transactionsCompleted: 0,
          disputeCount: 0
        });
      } else {
        await updateDoc(doc(db, "userProfiles", user.uid), data);
      }

      toast({ title: "Profile Updated", description: "Your details have been saved." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Saving", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navigation />
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" /></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <h1 className="text-4xl font-black text-[#225BC3] uppercase tracking-tighter">Account Hub</h1>
                <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-3 h-3 text-[#34CBED]" /> Manage Identity & Security
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-6">
               <Card className="rounded-[3rem] border-none shadow-xl bg-white p-8 ring-1 ring-[#225BC3]/5">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                       <Avatar className="w-24 h-24 border-4 border-white shadow-xl rounded-[2rem]">
                          <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} />
                          <AvatarFallback className="bg-[#225BC3] text-white font-black text-xl">{user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                       </Avatar>
                       <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                       />
                       <button 
                        className="absolute bottom-0 right-0 bg-[#225BC3] text-white p-2 rounded-xl shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                       >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                       </button>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                       {firstName || "Anonymous"} {lastName}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                       <Badge className="bg-green-100 text-green-700 font-black text-[9px] uppercase border-none">
                          {profile?.isIdVerified ? "Verified User" : "Account Setup"}
                       </Badge>
                    </div>
                  </div>
               </Card>

               <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4 ring-1 ring-slate-100">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#225BC3]">Security Status</h4>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                           <Smartphone className="w-4 h-4 text-slate-400" />
                           <span className="text-[11px] font-bold text-slate-600">Phone Verified</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                           <Mail className="w-4 h-4 text-slate-400" />
                           <span className="text-[11px] font-bold text-slate-600">Email Verified</span>
                        </div>
                        {user.emailVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Badge className="bg-orange-100 text-orange-600 border-none text-[8px] font-black uppercase">Pending</Badge>}
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4 text-slate-400" />
                           <span className="text-[11px] font-bold text-slate-600">ID Verification</span>
                        </div>
                        {profile?.isIdVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Badge className="bg-slate-200 text-slate-500 border-none text-[8px] font-black uppercase">Not Started</Badge>}
                     </div>
                  </div>
               </Card>
            </div>

            <div className="lg:col-span-2">
               <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white p-10 ring-1 ring-[#225BC3]/5">
                  <form onSubmit={handleSave} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">First Name</Label>
                           <Input className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Last Name</Label>
                           <Input className="h-14 rounded-2xl bg-slate-50 border-none font-bold" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Marketplace Bio</Label>
                        <Textarea 
                          className="min-h-[120px] rounded-2xl bg-slate-50 border-none font-medium text-sm leading-relaxed" 
                          placeholder="Tell us about your trade history..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                     </div>

                     <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Primary Trade Location</Label>
                        <div className="relative">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <Input className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Johannesburg, Sandton" />
                        </div>
                     </div>

                     <Button 
                       type="submit" 
                       className="w-full h-18 bg-[#225BC3] text-white font-black rounded-3xl text-lg shadow-2xl shadow-[#225BC3]/20 hover:scale-[1.01] transition-transform"
                       disabled={isSaving}
                     >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                           <span className="flex items-center gap-2"><Save className="w-5 h-5" /> Save Profile Details</span>
                        )}
                     </Button>
                  </form>
               </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
