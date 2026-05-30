"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  LayoutDashboard
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
    }
  };

  const features = [
    { name: "Marketplace", description: "Fixed Price & Lots", icon: ShoppingBag, href: "/search", color: "text-primary" },
    { name: "Timed Auctions", description: "Bidding & Bids", icon: Gavel, href: "/auctions", color: "text-accent" },
    { name: "Seller Hub", description: "Manage Inventory", icon: Briefcase, href: "/verify", color: "text-blue-500" },
    { name: "Rewards", description: "Viral Referrals", icon: Gift, href: "/referrals", color: "text-pink-500" },
    { name: "Safety Hub", description: "Legal & Protection", icon: Lock, href: "/legal", color: "text-green-500" },
    { name: "Health Logs", description: "System Integrity", icon: LayoutDashboard, href: "/admin/health", color: "text-slate-500" },
  ];

  return (
    <nav className="glass-navbar h-24 flex items-center px-6 mx-4 mt-6 rounded-[2.5rem] shadow-2xl border border-white/20 transition-all duration-500 z-50 sticky top-6">
      <div className="container mx-auto flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20 group-hover:rotate-6 transition-all duration-500">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl text-slate-900 tracking-tighter uppercase leading-none">THE <span className="text-primary">EXCHANGE</span></span>
            <span className="text-[8px] font-black text-slate-400 tracking-[0.4em] uppercase mt-1">Spatial Verified</span>
          </div>
        </Link>

        {/* Search Architecture */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative group">
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Deep search items, lots, or verified traders..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-14 pl-14 pr-6 rounded-[1.5rem] bg-white border-none shadow-inner focus:ring-4 focus:ring-primary/10 outline-none font-bold text-sm transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-4">
          <Link href="/create" className="hidden sm:block">
            <Button className="h-14 px-8 rounded-[1.2rem] bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
              <PlusCircle className="w-4 h-4 mr-2" />
              List Item
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-14 rounded-2xl px-6 gap-2 font-black uppercase text-[10px] tracking-widest text-slate-900 hover:bg-slate-100/50">
                Explore <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 rounded-[2.5rem] p-4 shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-none ring-1 ring-white/20 mt-6 animate-in fade-in zoom-in-95 duration-300 backdrop-blur-3xl bg-white/90">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 px-4 py-3">Navigation Engine</DropdownMenuLabel>
              <div className="grid grid-cols-1 gap-2">
                {features.map((f) => (
                  <DropdownMenuItem key={f.name} asChild className="rounded-2xl p-4 cursor-pointer focus:bg-primary/5 transition-all">
                    <Link href={f.href} className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-slate-50", f.color)}>
                        <f.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-900 uppercase leading-none mb-1">{f.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-tight">{f.description}</p>
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
                <Button size="icon" variant="ghost" className="rounded-full h-14 w-14 bg-white shadow-xl border-4 border-white overflow-hidden hover:scale-110 active:scale-90 transition-all">
                  <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} alt="user" className="w-full h-full object-cover" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-[2.5rem] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-none ring-1 ring-white/20 mt-6 backdrop-blur-3xl bg-white/90">
                <div className="flex items-center gap-4 px-2 pb-6 border-b border-slate-100 mb-4">
                   <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shadow-inner border-2 border-white">
                      <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} className="w-full h-full object-cover" />
                   </div>
                   <div className="min-w-0">
                      <p className="font-black text-sm text-slate-900 uppercase truncate tracking-tight">{profile?.firstName || user.displayName || 'Spatial User'}</p>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-widest py-1 px-2 mt-1 rounded-lg border-none shadow-sm",
                        profile?.isIdVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                      )}>
                        {profile?.isIdVerified ? 'Identity Verified' : 'Awaiting KYC'}
                      </Badge>
                   </div>
                </div>
                
                <DropdownMenuItem asChild className="rounded-xl p-4 font-black uppercase text-[10px] tracking-widest gap-4 cursor-pointer focus:bg-primary/5">
                  <Link href={`/profile/${user.uid}`}>
                    <User className="w-5 h-5 text-primary" /> Profile Hub
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl p-4 font-black uppercase text-[10px] tracking-widest gap-4 cursor-pointer focus:bg-primary/5">
                  <Link href="/settings">
                    <Settings className="w-5 h-5 text-primary" /> Core Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 my-3" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-4 font-black uppercase text-[10px] tracking-widest gap-4 text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <LogOut className="w-5 h-5" /> Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="h-14 px-10 rounded-[1.2rem] bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
