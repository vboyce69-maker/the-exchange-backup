
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  PlusCircle, 
  MessageSquare, 
  User, 
  TrendingUp, 
  Gavel,
  ShieldCheck,
  Home,
  Menu,
  LogOut,
  Settings,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Browse", href: "/", icon: Home },
    { name: "Auctions", href: "/auctions", icon: Gavel },
    { name: "Demand", href: "/insights", icon: TrendingUp },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8">
      <div className="container mx-auto h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-[#225BC3] p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl text-[#225BC3] tracking-tighter uppercase">THE <span className="text-[#34CBED]">EXCHANGE</span></span>
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
                  "flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all hover:text-[#34CBED] group",
                  pathname === item.href ? "text-[#34CBED]" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/create" className="hidden sm:block">
            <Button className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white font-black rounded-2xl h-11 px-6 shadow-lg shadow-orange-500/20 uppercase text-[10px] tracking-widest">
              <PlusCircle className="w-4 h-4 mr-2" />
              List Item
            </Button>
          </Link>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-2xl h-11 w-11 bg-muted/50 overflow-hidden">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl border-none ring-1 ring-black/5 mt-2">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-muted/50" />
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-[#225BC3]/5 focus:text-[#225BC3] cursor-pointer" asChild>
                <Link href="/profile/me">
                  <UserCircle className="w-4 h-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-[#225BC3]/5 focus:text-[#225BC3] cursor-pointer" asChild>
                <Link href="/verify">
                  <ShieldCheck className="w-4 h-4" />
                  Get Verified
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-[#225BC3]/5 focus:text-[#225BC3] cursor-pointer" asChild>
                 <Link href="/legal">
                  <Scale className="w-4 h-4" />
                  Legal Hub (CPA/POPIA)
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-muted/50" />
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 text-destructive focus:bg-destructive/5 cursor-pointer">
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
