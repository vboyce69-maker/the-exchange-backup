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
 * Enhanced: Redirects unverified users to verify-email, EXCEPT for the report page.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        const searchParams = new URLSearchParams();
        searchParams.set('redirect', pathname);
        router.push(`/login?${searchParams.toString()}`);
      } else if (!user.emailVerified && pathname !== '/verify-email' && pathname !== '/report') {
        // Redirection Pillar: Forces email activation before marketplace access
        // Bypass added for /report to allow unverified users to flag security issues
        router.push('/verify-email');
      }
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
        <h2 className="text-2xl font-black text-[#225BC3] uppercase">Access Restricted</h2>
      </div>
    );
  }

  // Safety Pillar: Prevent rendering if email isn't verified (except for specific allowed routes)
  if (!user.emailVerified && pathname !== '/verify-email' && pathname !== '/report') {
    return null;
  }

  return <>{children}</>;
}
