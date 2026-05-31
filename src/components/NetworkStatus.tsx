"use client";

import { useState, useEffect } from "react";
import { WifiOff, ShieldAlert, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(true);
      setTimeout(() => {
        setIsOffline(false);
        setIsReconnecting(false);
      }, 2000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !isReconnecting) return null;

  return (
    <div
      className={cn(
        "fixed top-20 left-0 right-0 z-[60] flex justify-center px-4 animate-in slide-in-from-top-4",
        isOffline ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md transition-all",
          isOffline
            ? "bg-[#225BC3] border-[#225BC3]/20 text-white"
            : "bg-[#34CBED] border-[#34CBED]/20 text-white",
        )}
      >
        {isReconnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Restoring Secure Connection...
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-[#34CBED]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Connection Offline
              </span>
              <span className="text-[8px] font-bold opacity-80 leading-none">
                Bids and payments are currently frozen.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
