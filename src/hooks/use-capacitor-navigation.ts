"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";

/**
 * Custom hook to handle Android hardware back button.
 * Prevents app exit and triggers Next.js router navigation instead.
 */
export function useCapacitorNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only register listener on native platforms
    const registerBackButton = async () => {
      const listener = await App.addListener("backButton", (canGoBack) => {
        if (pathname === "/" || pathname === "/login") {
          // Exit if on home or login screen
          App.exitApp();
        } else {
          // Otherwise, try to go back in Next.js history
          router.back();
        }
      });

      return listener;
    };

    let backButtonListener: any;
    registerBackButton().then((l) => (backButtonListener = l));

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [router, pathname]);
}
