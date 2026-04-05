
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
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Browse", href: "/", icon: Home },
    { name: "Auctions", href: "/auctions", icon: Gavel },
    { name: "Demand", href: "/insights", icon: TrendingUp },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-sm">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline font-bold text-xl text-primary tracking-tight">LocalBid <span className="text-accent">Exchange</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary py-2 px-1 border-b-2 border-transparent",
                  pathname === item.href ? "text-primary border-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block w-48 xl:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full bg-background border rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <Link href="/verify" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 font-bold">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Verify ID
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="hidden sm:flex border-primary text-primary hover:bg-primary/5 font-bold">
            <PlusCircle className="w-4 h-4 mr-2" />
            List Item
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full">
            <User className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
