
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  MessageSquare, 
  User, 
  TrendingUp, 
  Gavel,
  ShieldCheck,
  Home,
  LogOut,
  UserCircle,
  Scale,
  LogIn,
  ChevronDown,
  Lock,
  MapPin,
  Star,
  ShieldAlert,
  Layers,
  Fingerprint
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
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export function Navigation() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const navItems = [
    { name: "Browse", href: "/", icon: Home },
    { name: "Auctions", href: "/auctions", icon: Gavel },
    { name: "Demand", href: "/insights", icon: TrendingUp },
  ];

  const features = [
    { name: "Biometric KYC", description: "AI Identity Verification", icon: Fingerprint, href: "/verify", color: "text-blue-500" },
    { name: "Protected Payments", description: "Secure Escrow-Style Hold", icon: Lock, href: "/legal", color: "text-green-500" },
    { name: "Safe Zone Bookings", description: "Vetted Meetup Points", icon: MapPin, href: "/messages", color: "text-orange-500" },
    { name: "Reliability Scoring", description: "Behavior-Based Trust", icon: Star, href: "/profile/me", color: "text-yellow-500" },
    { name: "Anti-Scam Protection", description: "AI Chat Monitoring", icon: ShieldAlert, href: "/messages", color: "text-red-500" },
    { name: "Bulk Lot Auctions", description: "Inventory Clearance", icon: Layers, href: "/auctions", color: "text-purple-500" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4">
      <div className="container mx-auto h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-[#225BC3] p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black text-xl text-[#225BC3] tracking-tighter uppercase hidden xs:block">THE <span className="text-[#34CBED]">EXCHANGE</span></span>
            <span className="text-[7px] font-black text-[#225BC3]/60 tracking-widest uppercase hidden xs:block">Premium Marketplace</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:text-[#34CBED] group",
                  pathname === item.href ? "text-[#34CBED]" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}

          <Link 
            href="/messages"
            className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:text-[#34CBED]",
              pathname === "/messages" ? "text-[#34CBED]" : "text-muted-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Messages
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/create">
            <Button className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black rounded-2xl h-11 px-4 sm:px-6 shadow-lg shadow-orange-500/20 uppercase text-[9px] tracking-widest">
              <PlusCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">List Item</span>
            </Button>
          </Link>

          {/* Features Dropdown (Moved next to Sign In) */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#225BC3] hover:text-[#34CBED] outline-none h-11 px-4 rounded-2xl bg-[#225BC3]/5 hover:bg-[#225BC3]/10 transition-colors">
                  Features <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 rounded-[2rem] p-4 shadow-2xl border-none ring-1 ring-black/5 mt-2 bg-white grid grid-cols-1 gap-1">
                <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-[0.2em] text-[#225BC3] px-3 py-2">Advanced Security</DropdownMenuLabel>
                {features.map((feature) => (
                  <DropdownMenuItem key={feature.name} className="rounded-2xl p-3 cursor-pointer focus:bg-[#225BC3]/5 group" asChild>
                    <Link href={feature.href} className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-focus:bg-white group-focus:shadow-sm transition-all", feature.color)}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-xs text-slate-900 leading-none mb-1">{feature.name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground">{feature.description}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                <DropdownMenuItem className="rounded-2xl p-3 font-black text-[9px] uppercase tracking-widest text-[#34CBED] justify-center focus:text-[#225BC3] cursor-pointer" asChild>
                  <Link href="/legal">View Compliance Framework</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-2xl h-11 w-11 bg-slate-50 overflow-hidden border border-slate-100">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="user" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-[#225BC3]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 shadow-2xl border-none ring-1 ring-black/5 mt-2 bg-white">
                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Your Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                
                <div className="lg:hidden">
                  <DropdownMenuLabel className="font-black text-[8px] uppercase tracking-widest text-[#225BC3] px-4 pt-2">Navigation</DropdownMenuLabel>
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.href} className="rounded-xl p-3 font-bold gap-3 focus:bg-[#225BC3]/5 focus:text-[#225BC3]" asChild>
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-slate-100" />
                </div>

                <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-[#225BC3]/5 focus:text-[#225BC3] cursor-pointer" asChild>
                  <Link href={`/profile/${user.uid}`}>
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-[#225BC3]/5 focus:text-[#225BC3] cursor-pointer" asChild>
                  <Link href="/verify">
                    <ShieldCheck className="w-4 h-4 text-[#34CBED]" />
                    Get Verified
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-[#225BC3]/5 focus:text-[#225BC3] cursor-pointer" asChild>
                   <Link href="/legal">
                    <Scale className="w-4 h-4" />
                    Legal Hub (CPA/POPIA)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 font-bold gap-3 text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="rounded-2xl h-11 font-black uppercase text-[10px] tracking-widest text-[#225BC3] gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
