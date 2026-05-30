"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  User, 
  Gavel,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Lock,
  MapPin,
  Briefcase,
  ShoppingBag,
  Search,
  Settings,
  Gift,
  LayoutDashboard,
  Fingerprint,
  TrendingUp,
  LayoutGrid
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
import { doc, getCountFromServer, collection } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Badge } from "@/components/ui/badge";
import { MARKET_CONFIG } from "@/app/lib/market-config";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Navigation() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [searchVal, setSearchVal] = useState("");
  const [slotsLeft, setSlotsLeft] = useState(MARKET_CONFIG.FOUNDING_LIMIT);

  const profileRef = useMemoFirebase(() => {
    return user ? doc(db, "userProfiles", user.uid) : null;
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    async function fetchUserCount() {
      if (!db) return;
      try {
        const coll = collection(db, "userProfiles");
        const snapshot = await getCountFromServer(coll);
        setSlotsLeft(Math.max(0, MARKET_CONFIG.FOUNDING_LIMIT - snapshot.data().count));
      } catch (err) {
        console.error("Failed to fetch founding member count", err);
      }
    }
    fetchUserCount();
  }, [db]);

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
    }
  };

  const menuItems = [
    { 
      title: "Browse Marketplace", 
      desc: "Fixed Price & Lots", 
      href: "/search", 
      icon: ShoppingBag, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      title: "Live Auctions", 
      desc: "Bidding & Bulk Lots", 
      href: "/auctions", 
      icon: Gavel, 
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
    { 
      title: "Refer & Earn", 
      desc: "Viral Referral System", 
      href: "/referrals", 
      icon: Gift, 
      color: "text-pink-600", 
      bg: "bg-pink-50" 
    },
    { 
      title: "Biometric KYC", 
      desc: "AI Identity Verification", 
      href: "/verify", 
      icon: Fingerprint, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
    { 
      title: "Protected Payments", 
      desc: "Escrow-Style Hold", 
      href: "/legal", 
      icon: Lock, 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      title: "Market Insights", 
      desc: "Seller Demand Data", 
      href: "/insights", 
      icon: TrendingUp, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50" 
    },
    { 
      title: "Safe Zones", 
      desc: "Vetted Meetup Points", 
      href: "/legal", 
      icon: MapPin, 
      color: "text-red-600", 
      bg: "bg-red-50" 
    },
  ];

  return (
    <div className="w-full z-50">
      <nav className="h-[88px] bg-white border-b border-slate-100 flex items-center px-8 transition-all duration-500">
        <div className="container mx-auto flex items-center justify-between gap-12">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg group-hover:rotate-3 transition-all duration-500">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-slate-900 tracking-tighter uppercase leading-none">THE <span className="text-primary">EXCHANGE</span></span>
              <span className="text-[7px] font-black text-slate-400 tracking-[0.4em] uppercase mt-1">Premium Verified</span>
            </div>
          </Link>

          {/* Screenshot-Style Centered Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl relative group">
            <div className="relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search for items, brands, or categories..." 
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full h-[52px] pl-14 pr-6 rounded-full bg-slate-50 border border-slate-100 shadow-inner focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none font-medium text-sm transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-6">
            <Link href="/create" className="hidden sm:block">
              <Button className="h-[52px] px-8 rounded-full bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4 mr-2" />
                List Item
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-[52px] rounded-full px-6 gap-2 font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-slate-50">
                  Explore <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 rounded-[2.5rem] p-4 shadow-2xl border-none ring-1 ring-slate-100 mt-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-3 pb-4 mb-2 border-b border-slate-50">
                  <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 p-0">Platform Hub</DropdownMenuLabel>
                  <LayoutGrid className="w-3 h-3 text-slate-200" />
                </div>
                <ScrollArea className="h-[400px] pr-2">
                  <div className="space-y-1">
                    {menuItems.map((item, idx) => (
                      <DropdownMenuItem key={idx} asChild className="rounded-2xl p-3 cursor-pointer hover:bg-slate-50 transition-all group outline-none focus:bg-slate-50">
                        <Link href={item.href} className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110", item.bg, item.color)}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-xs uppercase tracking-tight text-slate-900 leading-none mb-1.5">{item.title}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{item.desc}</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-full h-[52px] w-[52px] bg-slate-50 border-2 border-white shadow-xl overflow-hidden hover:scale-110 active:scale-90 transition-all">
                    <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} alt="user" className="w-full h-full object-cover" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-[1.5rem] p-4 shadow-2xl border-none ring-1 ring-slate-100 mt-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900 uppercase truncate leading-none">{profile?.firstName || user.displayName || 'Trader'}</p>
                      <Badge className={cn("text-[7px] font-black uppercase tracking-widest mt-1.5", profile?.isIdVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600")}>
                        {profile?.isIdVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="rounded-xl p-3 font-bold uppercase text-[9px] tracking-widest gap-3">
                    <Link href={`/profile/${user.uid}`}><User className="w-4 h-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl p-3 font-bold uppercase text-[9px] tracking-widest gap-3">
                    <Link href="/settings"><Settings className="w-4 h-4" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 my-2" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 font-bold uppercase text-[9px] tracking-widest gap-3 text-red-500">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="h-[52px] px-10 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Announcement Architecture */}
      <div className="bg-primary text-white h-10 flex items-center justify-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
          Limited: Join the Founding 100 Sellers — <span className="text-secondary">{slotsLeft} Slots Left</span>
        </p>
      </div>
    </div>
  );
}
