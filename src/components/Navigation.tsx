
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
  Scale
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
import { useUser } from "@/firebase";

export function Navigation() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { name: "Browse", href: "/", icon: Home },
    { name: "Auctions", href: "/auctions", icon: Gavel },
    { name: "Demand", href: "/insights", icon: TrendingUp },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4">
      <div className="container mx-auto h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-[#225BC3] p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl text-[#225BC3] tracking-tighter uppercase hidden xs:block">THE <span className="text-[#34CBED]">EXCHANGE</span></span>
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
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/create">
            <Button className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black rounded-2xl h-11 px-4 sm:px-6 shadow-lg shadow-orange-500/20 uppercase text-[9px] tracking-widest">
              <PlusCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">List Item</span>
            </Button>
          </Link>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-2xl h-11 w-11 bg-slate-50 overflow-hidden border border-slate-100">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="user" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[#225BC3]" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 shadow-2xl border-none ring-1 ring-black/5 mt-2 bg-white">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Your Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              
              {/* Mobile-only nav items inside dropdown */}
              <div className="lg:hidden">
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
                <Link href={user ? `/profile/${user.uid}` : "/verify"}>
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
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
