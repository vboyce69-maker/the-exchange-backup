
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
  AlertCircle,
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
    { name: "Marketplace", description: "Fixed Price & Lots", icon: ShoppingBag, href: "/search", color: "text-primary" },
    { name: "Timed Auctions", description: "Bidding & Bids", icon: Gavel, href: "/auctions", color: "text-accent" },
    { name: "Seller Hub", description: "Manage Inventory", icon: Briefcase, href: "/verify", color: "text-blue-500" },
    { name: "Rewards", description: "Viral Referrals", icon: Gift, href: "/referrals", color: "text-pink-500" },
    { name: "Safety Hub", description: "Legal & Protection", icon: Lock, href: "/legal", color: "text-green-500" },
    { name: "Health Logs", description: "System Integrity", icon: LayoutDashboard, href: "/admin/health", color: "text-slate-500" },
  ];

  return (
    <nav className="glass-navbar h-[88px] flex items-center px-4 transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl text-slate-900 tracking-tighter uppercase leading-none">THE <span className="text-primary">EXCHANGE</span></span>
            <span className="text-[8px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Premium Verified</span>
          </div>
        </Link>

        {/* Desktop Search - TAKEALOT STYLE */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl relative group">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search for items, brands, or categories..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-100 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none font-medium text-sm transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <Link href="/create" className="hidden sm:block">
            <Button className="btn-premium h-11 px-6 bg-primary text-white shadow-md shadow-primary/10">
              <PlusCircle className="w-4 h-4 mr-2" />
              List Item
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 rounded-2xl px-4 gap-2 font-bold text-slate-600 hover:bg-slate-100">
                Explore <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 rounded-3xl p-3 shadow-2xl border-none ring-1 ring-slate-100 mt-4 animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuLabel className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400 px-3 py-2">Quick Navigation</DropdownMenuLabel>
              <div className="grid grid-cols-1 gap-1">
                {features.map((f) => (
                  <DropdownMenuItem key={f.name} asChild className="rounded-2xl p-3 cursor-pointer focus:bg-slate-50">
                    <Link href={f.href} className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center", f.color)}>
                        <f.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 leading-none mb-1">{f.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{f.description}</p>
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
                <Button size="icon" variant="ghost" className="rounded-2xl h-11 w-11 bg-slate-100 border border-slate-200/50 overflow-hidden hover:scale-105 transition-transform">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="user" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-3xl p-4 shadow-2xl border-none ring-1 ring-slate-100 mt-4">
                <div className="flex items-center gap-3 px-2 pb-4 border-b border-slate-100 mb-2">
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden">
                      <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} className="w-full h-full object-cover" />
                   </div>
                   <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{profile?.firstName || user.displayName || 'Verified User'}</p>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-wider py-0.5 px-1.5",
                        profile?.isIdVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                      )}>
                        {profile?.isIdVerified ? 'Verified Profile' : 'Pending Verification'}
                      </Badge>
                   </div>
                </div>
                
                <DropdownMenuItem asChild className="rounded-xl p-3 font-bold gap-3 cursor-pointer">
                  <Link href={`/profile/${user.uid}`}>
                    <User className="w-4 h-4 text-primary" /> Public Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl p-3 font-bold gap-3 cursor-pointer">
                  <Link href="/settings">
                    <Settings className="w-4 h-4 text-primary" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50 my-2" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 font-bold gap-3 text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="btn-premium h-11 px-8 bg-slate-900 text-white shadow-xl">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
