
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
  UserCircle
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
          <div className="bg-accent p-2 rounded-xl shadow-lg shadow-accent/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline font-black text-2xl text-primary tracking-tighter">THE <span className="text-accent">EXCHANGE</span></span>
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
                  "flex items-center gap-2 text-sm font-bold transition-all hover:text-accent group",
                  pathname === item.href ? "text-accent" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", pathname === item.href && "fill-accent/10")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden xl:block w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Find anything..." 
              className="w-full bg-muted/50 border-none rounded-2xl h-11 pl-12 pr-4 text-sm focus:ring-2 focus:ring-accent/20 transition-all outline-none"
            />
          </div>
          
          <Link href="/create" className="hidden sm:block">
            <Button className="bg-accent hover:bg-accent/90 text-white font-black rounded-2xl h-11 px-6 shadow-lg shadow-accent/20">
              <PlusCircle className="w-4 h-4 mr-2" />
              List Item
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-2xl h-11 w-11 bg-muted/50 lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="rounded-l-[2.5rem] p-0 border-none shadow-2xl">
              <SheetHeader className="p-8 border-b">
                <SheetTitle className="text-left font-black text-2xl flex items-center gap-2">
                   <ShieldCheck className="w-6 h-6 text-accent" />
                   THE EXCHANGE
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-2 mt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl font-bold transition-all",
                        pathname === item.href ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"
                      )}>
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
                <Link href="/create">
                  <div className="flex items-center gap-4 p-4 rounded-2xl font-bold bg-accent text-white mt-4 shadow-lg shadow-accent/20">
                    <PlusCircle className="w-5 h-5" />
                    List an Item
                  </div>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-2xl h-11 w-11 bg-muted/50 hidden lg:flex overflow-hidden">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl border-none ring-1 ring-black/5 mt-2">
              <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground px-4 py-3">Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-muted/50" />
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-accent/5 focus:text-accent cursor-pointer" asChild>
                <Link href="/profile/me">
                  <UserCircle className="w-4 h-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-accent/5 focus:text-accent cursor-pointer" asChild>
                <Link href="/verify">
                  <ShieldCheck className="w-4 h-4" />
                  Get Verified
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 focus:bg-accent/5 focus:text-accent cursor-pointer">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-muted/50" />
              <DropdownMenuItem className="rounded-xl p-3 font-bold gap-3 text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer">
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
