'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Higher-Order Component to protect routes requiring authentication.
 * Aligned with Next.js App Router security patterns.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      // Redirect to login, preserving the attempted destination
      const searchParams = new URLSearchParams();
      searchParams.set('redirect', pathname);
      router.push(`/login?${searchParams.toString()}`);
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#225BC3]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifying Session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#225BC3]">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#225BC3] uppercase tracking-tighter">Access Restricted</h2>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
            Please sign in to access the secure marketplace features.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
