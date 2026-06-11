"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase,
  useStorage,
} from "@/firebase";
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
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "userProfiles", user.uid);
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
    if (!file || !user || !storage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profile_pics/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Auth Profile for faster header display
      await updateProfile(user, { photoURL: downloadURL });
      
      // Update Firestore for identity persistence
      if (db) {
        const userRef = doc(db, "userProfiles", user.uid);
        await updateDoc(userRef, { profileImageUrl: downloadURL });
      }

      toast({
        title: "Avatar Saved",
        description: "Your new profile picture is synced to the cloud.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: err.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setIsSaving(true);
    try {
      const data = {
        firstName,
        lastName,
        bio,
        locationName,
        updatedAt: new Date().toISOString(),
        email: user.email,
        phoneNumber: user.phoneNumber ?? null,
      };

      const profileDocRef = doc(db, "userProfiles", user.uid);
      // Use setDoc with merge to ensure profile exists if login sync failed
      await setDoc(profileDocRef, data, { merge: true });

      toast({
        title: "Persistence Confirmed",
        description: "Your profile details are securely saved.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-[#225BC3] uppercase tracking-tighter">
                Identity Settings
              </h1>
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-3 h-3 text-[#34CBED]" /> Cloud Sync Enabled
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-6">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-8 ring-1 ring-[#225BC3]/5">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-xl rounded-[2rem]">
                      <AvatarImage
                        src={
                          profile?.profileImageUrl ||
                          user.photoURL ||
                          `https://picsum.photos/seed/${user.uid}/200/200`
                        }
                      />
                      <AvatarFallback className="bg-[#225BC3] text-white font-black text-xl">
                        {firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      capture="user"
                      onChange={handleImageUpload}
                    />
                    <button
                      className="absolute bottom-0 right-0 bg-[#225BC3] text-white p-2 rounded-xl shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {firstName || "Market"} {lastName || "Trader"}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={cn(
                      "font-black text-[9px] uppercase border-none",
                      profile?.kycStatus === 'verified' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                    )}>
                      {profile?.kycStatus === 'verified' ? "Verified Pro" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-6 space-y-4 ring-1 ring-slate-100">
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#225BC3]">
                  Security Pillar Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-600">
                        Phone Bonded
                      </span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-between p-3 bg-slate-50 rounded-xl transition-all",
                      !user.emailVerified && "cursor-pointer hover:bg-orange-50"
                    )}
                    onClick={() => !user.emailVerified && router.push("/verify-email")}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className={cn("w-4 h-4", user.emailVerified ? "text-green-500" : "text-slate-400")} />
                      <span className="text-[11px] font-bold text-slate-600">
                        Email Bonded
                      </span>
                    </div>
                    {user.emailVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Badge className="bg-orange-100 text-orange-600 border-none text-[8px] font-black uppercase">Pending</Badge>
                    )}
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
                      <Input
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Last Name</Label>
                      <Input
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Market Bio</Label>
                    <Textarea
                      className="min-h-[120px] rounded-2xl bg-slate-50 border-none font-medium text-sm"
                      placeholder="Share your trade specialty..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-[#225BC3]">Primary Region</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-bold"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="e.g. Gauteng, Johannesburg"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-18 bg-[#225BC3] text-white font-black rounded-3xl text-lg shadow-2xl"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Save Persistence"}
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
