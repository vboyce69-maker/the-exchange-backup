"use client";

import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";
import { logSystemError } from "@/app/lib/error-logger";
import { useFirestore, useUser } from "@/firebase";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const db = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    // Log the error for AI correction and Admin review
    console.error("Application Crash:", error);
    if (db) {
    logSystemError(db, error, { userId: user?.uid });
    }
  }, [error, db, user]);

  return (
    <div className="min-h-screen bg-[#EEF1F3] flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95">
          <div className="w-24 h-24 bg-red-100 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-[#225BC3] tracking-tighter uppercase">
              Session Interrupted
            </h1>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              We encountered a temporary technical glitch. Our AI recovery agent
              has been notified and is analyzing the issue to prevent it from
              happening again.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => reset()}
              className="h-16 rounded-2xl bg-[#225BC3] text-white font-black text-lg shadow-xl shadow-[#225BC3]/20 hover:scale-[1.02] transition-transform"
            >
              <RefreshCw className="w-5 h-5 mr-2" /> Secure Reload
            </Button>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="h-14 font-bold text-slate-500"
            >
              <Home className="w-4 h-4 mr-2" /> Return to Safety
            </Button>
          </div>
          <div className="pt-8 opacity-40">
            <p className="text-[8px] font-black uppercase tracking-widest">
              Automated Diagnostic Report Transmitted
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
