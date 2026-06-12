"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

/**
 * Custom hook to handle Android hardware back button.
 * Prevents app exit and triggers Next.js router navigation instead.
 */
export function useCapacitorNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backButtonListener: any;

    const setupListener = async () => {
      backButtonListener = await App.addListener("backButton", () => {
        // Only exit if we are on a "root" page.
        // For all other pages, we trigger the router to go back.
        if (pathname === "/" || pathname === "/login") {
          App.exitApp();
        } else {
          router.back();
        }
      });
    };

    setupListener();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [router, pathname]);
}
