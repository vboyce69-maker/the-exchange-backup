
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  ShoppingBag,
  Search,
  Settings,
  Gift,
  LayoutGrid,
  ShieldAlert,
  Bell,
  Fingerprint,
  TrendingUp,
  Inbox,
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
import {
  useUser,
  useAuth,
  useFirestore,
  useDoc,
  useMemoFirebase,
  useCollection,
} from "@/firebase";
import {
  doc,
  getCountFromServer,
  collection,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Badge } from "@/components/ui/badge";
import { MARKET_CONFIG } from "@/app/lib/market-config";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [searchVal, setSearchVal] = useState("");
  const [slotsLeft, setSlotsLeft] = useState(MARKET_CONFIG.FOUNDING_LIMIT);

  const profileRef = useMemoFirebase(() => {
    return user?.uid ? doc(db!, "userProfiles", user.uid) : null;
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef as any);

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("isRead", "==", false),
    );
  }, [db, user?.uid]);

  const { data: unreadNotifications } = useCollection(notificationsQuery);

  useEffect(() => {
    async function fetchUserCount() {
      if (!db) return;
      try {
        const coll = collection(db, "userProfiles");
        const snapshot = await getCountFromServer(coll);
        setSlotsLeft(
          Math.max(0, MARKET_CONFIG.FOUNDING_LIMIT - snapshot.data().count),
        );
      } catch (err) {
        console.error("Failed to fetch founding member count", err);
      }
    }
    fetchUserCount();
  }, [db]);

  const handleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth);
        router.push("/");
      }
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
      bg: "bg-blue-50",
    },
    {
      title: "Live Auctions",
      desc: "Bidding & Bulk Lots",
      href: "/auctions",
      icon: Gavel,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Refer & Earn",
      desc: "Viral Referral System",
      href: "/referrals",
      icon: Gift,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      title: "Report Incident",
      desc: "Disputes & Safety",
      href: "/report",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Biometric KYC",
      desc: "AI Identity Verification",
      href: "/verify",
      icon: Fingerprint,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Price Insights",
      desc: "Market Trends AI",
      href: "/insights",
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="w-full z-50 sticky top-0">
      <nav className="h-[72px] lg:h-[88px] bg-white/70 backdrop-blur-xl border-b border-white/20 flex items-center px-2 sm:px-4 lg:px-8 shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-4 lg:gap-12">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 lg:w-11 lg:h-11 bg-primary rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-500 ring-4 ring-primary/5">
              <ShieldCheck className="w-5 h-5 lg:w-7 lg:h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-lg lg:text-xl text-slate-900 tracking-tight leading-none uppercase">
                The Exchange
              </span>
              <span className="text-[6px] lg:text-[7px] font-black text-primary tracking-[0.3em] lg:tracking-[0.4em] uppercase mt-0.5 lg:mt-1">
                Verified Layer
              </span>
            </div>
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative group"
          >
            <div className="relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Secure Market Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full h-[52px] pl-14 pr-6 rounded-[1.2rem] bg-slate-500/5 border border-slate-200/50 focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none font-medium text-sm transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
            <div className="flex items-center gap-1 lg:gap-2 sm:mr-2">
              <Link
                href="/notifications"
                className="relative group"
              >
                <div
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 lg:h-11 lg:w-11 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center transition-all bg-white/50 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-primary/10",
                    (unreadNotifications?.length || 0) > 0 && "animate-pulse",
                  )}
                >
                  <Bell
                    className={cn(
                      "w-4 h-4 lg:w-5 lg:h-5",
                      (unreadNotifications?.length || 0) > 0
                        ? "text-[#FF8C00] fill-current"
                        : "text-slate-400 group-hover:text-primary",
                    )}
                  />
                  {(unreadNotifications?.length || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[6px] lg:text-[8px] font-black w-3.5 h-3.5 lg:w-5 lg:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      {unreadNotifications?.length}
                    </span>
                  )}
                </div>
              </Link>

              <Link
                href="/messages"
                className="group"
              >
                <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-11 lg:w-11 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center bg-white/50 border border-slate-100 transition-all text-slate-400 group-hover:text-primary hover:bg-white hover:shadow-lg hover:border-primary/10">
                  <Inbox className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:h-11 rounded-lg sm:rounded-xl lg:rounded-2xl px-0 sm:px-3 lg:px-5 gap-1.5 sm:gap-2 font-black uppercase text-[9px] lg:text-[10px] tracking-widest text-slate-600 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 flex items-center justify-center"
                >
                  <LayoutGrid className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Explore</span> <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 opacity-50 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 sm:w-80 rounded-[2.5rem] p-4 shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-none ring-1 ring-slate-100 mt-4 backdrop-blur-3xl bg-white/90">
                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 px-4 pb-4">
                  Market Ecosystem
                </DropdownMenuLabel>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1.5 pr-2">
                    {menuItems.map((item, idx) => (
                      <DropdownMenuItem
                        key={idx}
                        asChild
                        className="rounded-2xl p-3.5 cursor-pointer hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all group border border-transparent hover:border-slate-100"
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-4"
                        >
                          <div
                            className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:rotate-3",
                              item.bg,
                              item.color,
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-[11px] uppercase tracking-tight text-slate-900 leading-none mb-1.5">
                              {item.title}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 sm:h-8 w-px bg-slate-200/50 mx-0.5 sm:mx-1" />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg sm:rounded-xl lg:rounded-2xl h-8 w-8 sm:h-9 sm:w-9 lg:h-[48px] lg:w-[48px] bg-white border-2 border-white shadow-xl overflow-hidden hover:scale-105 active:scale-95 transition-all ring-1 ring-slate-100"
                  >
                    <img
                      src={
                        user.photoURL ||
                        `https://picsum.photos/seed/${user.uid}/200/200`
                      }
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 lg:w-72 rounded-[2rem] p-4 shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-none mt-4 backdrop-blur-3xl bg-white/90"
                >
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100 mb-4 px-2">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0">
                      <img
                        src={
                          user.photoURL ||
                          `https://picsum.photos/seed/${user.uid}/200/200`
                        }
                        className="w-full h-full object-cover"
                        alt="Avatar"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-slate-900 uppercase truncate leading-none mb-2">
                        {profile?.firstName || "Market Trader"}
                      </p>
                      <Badge
                        className={cn(
                          "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 border-none",
                          profile?.kycStatus === 'verified'
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-600",
                        )}
                      >
                        {profile?.kycStatus === 'verified' ? "Verified Pro" : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl p-3 font-black uppercase text-[10px] tracking-widest gap-3 transition-all hover:bg-primary/5 hover:text-primary"
                    >
                      <Link href={`/profile/${user.uid}`}>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary/10">
                          <User className="w-4 h-4" />
                        </div>
                        Public Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl p-3 font-black uppercase text-[10px] tracking-widest gap-3 transition-all hover:bg-primary/5 hover:text-primary"
                    >
                      <Link href="/settings">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <Settings className="w-4 h-4" />
                        </div>
                        Sync Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-slate-100" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="rounded-xl p-3 font-black uppercase text-[10px] tracking-widest gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogOut className="w-4 h-4" />
                      </div>
                      Sign Out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="h-8 sm:h-10 lg:h-12 px-3 sm:px-6 lg:px-8 rounded-lg sm:rounded-xl lg:rounded-2xl bg-slate-900 text-white font-black uppercase text-[8px] sm:text-[9px] lg:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-primary via-[#225BC3] to-primary text-white h-12 lg:h-16 flex items-center justify-center relative overflow-hidden px-4 border-b border-white/10 shadow-[0_4px_20px_rgba(37,99,235,0.25)]">
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

        <div className="flex items-center gap-4 lg:gap-10 z-10">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] lg:text-[11px] font-black uppercase px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping" /> 🚀 Founding 100
            </div>
            <p className="text-[10px] lg:text-[12px] font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] drop-shadow-sm">
              Sellers Program <span className="hidden sm:inline opacity-50 mx-2">—</span>
              <span className="text-secondary font-bold ml-1 hidden sm:inline">{slotsLeft} spots remaining.</span>
            </p>
          </div>

          <div className="hidden lg:block h-6 w-px bg-white/20" />

          <p className="text-[9px] lg:text-[11px] font-medium text-blue-50 uppercase tracking-widest hidden md:block">
            Verified sellers receive <span className="text-secondary font-black">reduced platform fees</span> & priority placement.
          </p>

          <Badge className="bg-secondary text-slate-900 border-none text-[9px] lg:text-[11px] font-black uppercase px-4 py-1.5 shadow-xl shadow-black/10 scale-105 hover:scale-110 transition-transform cursor-default">
            {slotsLeft} Open Slots
          </Badge>
        </div>
      </div>
    </div>
  );
}
