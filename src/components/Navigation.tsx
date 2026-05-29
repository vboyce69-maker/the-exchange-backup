
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  User, 
  TrendingUp, 
  Gavel,
  ShieldCheck,
  LogOut,
  LogIn,
  ChevronDown,
  Lock,
  MapPin,
  Briefcase,
  ShoppingBag,
  Search,
  Fingerprint,
  Scale,
  Settings,
  X,
  Gift,
  Mail,
  ScanFace,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Badge } from "@/components/ui/badge";

export function Navigation() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [searchVal, setSearchVal] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Fetch real-time verification status for the profile menu
  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, "userProfiles", user.uid) : null;
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal)}`);
      setIsMobileSearchOpen(false);
    }
  };

  const features = [
    { name: "Browse Marketplace", description: "Fixed Price & Lots", icon: ShoppingBag, href: "/search", color: "text-[#225BC3]" },
    { name: "Live Auctions", description: "Bidding & Bulk Lots", icon: Gavel, href: "/auctions", color: "text-[#FF8C00]" },
    { name: "Refer & Earn", description: "Viral Referral System", icon: Gift, href: "/referrals", color: "text-pink-500" },
    { name: "Biometric KYC", description: "AI Identity Verification", icon: Fingerprint, href: "/verify", color: "text-blue-500" },
    { name: "Protected Payments", description: "Escrow-Style Hold", icon: Lock, href: "/legal", color: "text-green-500" },
    { name: "Market Insights", description: "Seller Demand Data", icon: TrendingUp, href: "/insights", color: "text-purple-500" },
    { name: "Safe Zones", description: "Vetted Meetup Points", icon: MapPin, href: "/messages", color: "text-orange-500" },
    { name: "AI Test Center", description: "Autonomous QA Agent", icon: Settings, href: "/admin/test-center", color: "text-red-500" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-2 lg:px-4">
      <div className="container mx-auto h-14 lg:h-16 flex items-center justify-between gap-1 lg:gap-2">
        <Link href="/" className="flex items-center gap-1.5 lg:gap-2 shrink-0 group">
          <div className="bg-[#225BC3] p-1 lg:p-2 rounded-lg lg:rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="flex flex-col space-y-0">
            <span className="font-black text-xl lg:text-3xl text-[#225BC3] tracking-tighter uppercase leading-none">THE <span className="text-[#34CBED]">EXCHANGE</span></span>
            <span className="text-[5px] lg:text-[7px] font-black text-[#225BC3]/60 tracking-widest uppercase mt-0.5">Verified Marketplace</span>
          </div>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-8 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#225BC3] group-focus-within:scale-110 transition-all duration-300 z-10" />
          <input 
            type="text" 
            placeholder="Search for items, brands..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-10 pl-11 pr-4 rounded-2xl bg-white border border-[#225BC3]/20 shadow-sm focus:border-[#225BC3]/40 focus:ring-4 focus:ring-[#225BC3]/5 outline-none font-medium text-sm transition-all"
          />
        </form>

        <div className="flex items-center gap-1 lg:gap-4">
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-xl h-8 w-8 lg:h-9 lg:w-9 text-[#225BC3] active:scale-95"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <Search className="w-4 h-4" />
          </Button>

          <Link href="/verify">
            <Button variant="outline" className="border-[#225BC3]/20 text-[#225BC3] font-black rounded-xl lg:rounded-2xl h-8 lg:h-9 px-2.5 lg:px-6 uppercase text-[8px] lg:text-[10px] tracking-tighter active:scale-95 transition-transform hover:bg-[#225BC3]/5">
              <Briefcase className="w-3.5 h-3.5 lg:w-4 lg:mr-2" />
              <span className="hidden sm:inline">Seller Hub</span>
            </Button>
          </Link>

          <Link href="/create">
            <Button className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black rounded-xl lg:rounded-2xl h-8 lg:h-9 px-2.5 lg:px-6 shadow-lg shadow-orange-500/20 uppercase text-[8px] lg:text-[10px] tracking-tighter active:scale-95 transition-transform">
              <PlusCircle className="w-3.5 h-3.5 lg:w-4 lg:mr-2" />
              <span className="hidden sm:inline">List Item</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-[8px] lg:text-[10px] font-black uppercase tracking-tighter text-[#225BC3] hover:text-[#34CBED] outline-none h-8 lg:h-9 px-2 lg:px-4 rounded-xl lg:rounded-2xl bg-[#225BC3]/5 hover:bg-[#225BC3]/10 transition-colors border border-[#225BC3]/10 active:scale-95">
                <span className="hidden xs:inline">Hub</span> <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 max-h-[80vh] overflow-y-auto rounded-[2rem] p-4 shadow-2xl border-none ring-1 ring-black/5 mt-2 bg-white grid grid-cols-1 gap-1">
              <div className="sticky top-0 bg-white z-10 pb-2">
                <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-[0.2em] text-[#225BC3] px-3 py-2 flex items-center justify-between">
                  Platform Hub
                  <Briefcase className="w-3 h-3" />
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 mx-3" />
              </div>
              <div className="space-y-1">
                {features.map((feature) => (
                  <DropdownMenuItem key={feature.name} className="rounded-2xl p-3 cursor-pointer focus:bg-[#225BC3]/5 group" asChild>
                    <Link href={feature.href} className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-focus:bg-white group-focus:shadow-sm transition-all shadow-sm", feature.color)}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-xs text-slate-900 leading-none mb-1">{feature.name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground">{feature.description}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-xl lg:rounded-2xl h-8 w-8 lg:h-9 lg:w-9 bg-slate-50 overflow-hidden border border-slate-100 active:scale-95">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="user" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 lg:w-5 lg:h-5 text-[#225BC3]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-[2rem] p-4 shadow-2xl border-none ring-1 ring-black/5 mt-2 bg-white">
                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 px-3 pb-3">Identity Center</DropdownMenuLabel>
                
                {/* Verification Status Summary */}
                <div className="px-3 mb-4 space-y-2">
                   <div 
                    className={cn(
                      "flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all",
                      !profile?.isIdVerified && "cursor-pointer hover:bg-orange-50 hover:border-orange-200"
                    )}
                    onClick={() => !profile?.isIdVerified && router.push('/verify')}
                   >
                      <div className="flex items-center gap-2">
                        <ScanFace className={cn("w-4 h-4", profile?.isIdVerified ? "text-green-500" : "text-slate-400")} />
                        <span className="text-[10px] font-black uppercase text-slate-700">Identity KYC</span>
                      </div>
                      {profile?.isIdVerified ? (
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <Badge className="bg-orange-100 text-orange-600 text-[8px] font-black border-none uppercase">Pending</Badge>
                      )}
                   </div>
                   <div 
                    className={cn(
                      "flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all",
                      !user.emailVerified && "cursor-pointer hover:bg-red-50 hover:border-red-200"
                    )}
                    onClick={() => !user.emailVerified && router.push('/verify')}
                   >
                      <div className="flex items-center gap-2">
                        <Mail className={cn("w-4 h-4", user.emailVerified ? "text-green-500" : "text-slate-400")} />
                        <span className="text-[10px] font-black uppercase text-slate-700">Email Verified</span>
                      </div>
                      {user.emailVerified ? (
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <Badge className="bg-red-100 text-red-600 text-[8px] font-black border-none uppercase">Action</Badge>
                      )}
                   </div>
                </div>

                {!profile?.isIdVerified && (
                  <DropdownMenuItem asChild className="rounded-xl p-4 font-black bg-[#225BC3] text-white focus:bg-[#225BC3]/90 focus:text-white cursor-pointer mb-2">
                    <Link href="/verify" className="flex items-center gap-3">
                      <Fingerprint className="w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="text-xs uppercase">Complete Verification</span>
                        <span className="text-[8px] opacity-80">Facial Recognition & ID Upload</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem asChild className="rounded-xl p-3 font-bold gap-3 cursor-pointer">
                  <Link href={`/profile/${user.uid}`}>
                    <User className="w-4 h-4 text-[#225BC3]" /> Public Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl p-3 font-bold gap-3 cursor-pointer">
                  <Link href="/settings">
                    <Settings className="w-4 h-4 text-[#225BC3]" /> Manage Account
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 font-bold gap-3 text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="rounded-xl lg:rounded-2xl h-8 lg:h-9 font-black uppercase text-[8px] lg:text-[10px] tracking-tighter text-[#225BC3] gap-1 lg:gap-1.5 border border-[#225BC3]/10 active:scale-95">
                <LogIn className="w-3.5 h-3.5 lg:w-4" />
                <span className="hidden xs:inline">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {isMobileSearchOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-14 bg-white p-4 shadow-xl border-b animate-in slide-in-from-top-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#225BC3] z-10" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search marketplace..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-11 pl-11 pr-12 rounded-2xl bg-white border border-[#225BC3]/20 outline-none font-bold text-sm shadow-sm focus:border-[#225BC3]/40 transition-all"
            />
            <Button 
              type="button" 
              variant="ghost" 
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </nav>
  );
}
