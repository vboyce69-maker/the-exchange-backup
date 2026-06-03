
"use client";

import { Navigation } from "@/components/Navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Bell,
  Tag,
  AlertCircle,
  Trash2,
  Loader2,
  CheckCircle2,
  History,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}

function NotificationsContent() {
  const { user } = useUser();
  const db = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
    );
  }, [db, user?.uid]);

  const { data: notifications, isLoading } = useCollection(notificationsQuery);

  const markAsRead = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotification = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      toast({ title: "Notification Cleared" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove notification.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-[#225BC3] uppercase tracking-tighter">
                Market Alerts
              </h1>
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Bell className="w-3 h-3 text-[#34CBED]" /> Price Drops & System
                Updates
              </p>
            </div>
            <Badge
              variant="outline"
              className="h-10 px-6 rounded-2xl font-black text-slate-400 border-slate-200 uppercase tracking-widest"
            >
              {notifications?.filter((n) => !n.isRead).length || 0} New
            </Badge>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-[#225BC3]" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              notifications.map((n) => (
                <Card
                  key={n.id}
                  className={cn(
                    "rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden transition-all group",
                    !n.isRead ? "ring-2 ring-[#225BC3]/20" : "opacity-70",
                  )}
                  onMouseEnter={() => !n.isRead && markAsRead(n.id)}
                >
                  <div className="p-8 flex gap-6 items-start">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner",
                        n.type === "price_drop"
                          ? "bg-green-50 text-green-600"
                          : "bg-blue-50 text-[#225BC3]",
                      )}
                    >
                      {n.type === "price_drop" ? (
                        <TrendingDown className="w-8 h-8" />
                      ) : (
                        <Tag className="w-8 h-8" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight leading-none">
                          {n.title}
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          {n.timestamp
                            ? new Date(
                                n.timestamp.seconds * 1000,
                              ).toLocaleDateString()
                            : "Just now"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-lg">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-4 pt-3">
                        {n.listingId && (
                          <Link href={`/listings/${n.listingId}`}>
                            <Button
                              size="sm"
                              className="bg-[#225BC3] text-white font-black rounded-xl h-9 px-6 text-[10px] uppercase tracking-widest"
                            >
                              View Item{" "}
                              <ChevronRight className="w-3 h-3 ml-2" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => clearNotification(n.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-32 bg-white rounded-[4rem] shadow-sm border-2 border-dashed border-slate-100">
                <CheckCircle2 className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <p className="font-black text-[#225BC3] uppercase tracking-widest">
                  No Alerts
                </p>
                <p className="text-muted-foreground text-sm font-medium mt-2">
                  We'll notify you here about price drops on items you're
                  watching.
                </p>
                <Link href="/search">
                  <Button className="mt-8 rounded-2xl bg-[#225BC3] font-black h-12 px-8 uppercase text-[10px] tracking-widest">
                    Discover Items
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="pt-10 text-center opacity-40">
            <div className="flex items-center justify-center gap-3 mb-2">
              <History className="w-3 h-3 text-slate-400" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                Notification Logs Retention: 30 Days
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
