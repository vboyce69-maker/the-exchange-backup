
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
  CheckCircle,
  Menu
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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8">
      <div className="container mx-auto h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-accent p-2 rounded-xl shadow-lg shadow-accent/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline font-black text-2xl text-primary tracking-tighter">THE <span className="text-accent">EXCHANGE</span></span>
        </Link>

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
          <Button size="icon" variant="ghost" className="rounded-2xl h-11 w-11 bg-muted/50 lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-2xl h-11 w-11 bg-muted/50 hidden lg:flex">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
