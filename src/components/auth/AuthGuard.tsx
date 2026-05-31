"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2, Lock } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Higher-Order Component to protect routes requiring authentication.
 * Enhanced: Redirects unverified users to verify-email before marketplace access.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        const searchParams = new URLSearchParams();
        searchParams.set("redirect", pathname);
        router.push(`/login?${searchParams.toString()}`);
      } else {
        // Verification Pillar: Enforce email verification
        const isVerified = user.emailVerified;
        const isExcludedPath =
          pathname === "/verify-email" ||
          pathname === "/report" ||
          pathname === "/verify";

        if (!isVerified && !isExcludedPath) {
          router.push("/verify-email");
        }
      }
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Syncing Identity Pillar...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#225BC3]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#225BC3] uppercase">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-400 font-medium">
          Please sign in to continue to 'The Exchange'.
        </p>
      </div>
    );
  }

  // Prevent rendering for unverified users on marketplace pages
  if (
    !user.emailVerified &&
    pathname !== "/verify-email" &&
    pathname !== "/report" &&
    pathname !== "/verify"
  ) {
    return null;
  }

  return <>{children}</>;
}
