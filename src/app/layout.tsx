import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase";
import { Toaster } from "@/components/ui/toaster";
import { NetworkStatus } from "@/components/NetworkStatus";

export const metadata: Metadata = {
  title: "The Exchange | Premium Verified Marketplace",
  description: "Verified Sellers, Secure Deals, No Scams, Just Good Trades.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Exchange",
  },
};

export const viewport: Viewport = {
  themeColor: "#225BC3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="apple-touch-icon"
          href="https://picsum.photos/seed/exchange-icon/180/180"
        />
      </head>
      <body
        className="antialiased selection:bg-primary/10 selection:text-primary overflow-x-hidden touch-pan-y"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <FirebaseClientProvider>
          <NetworkStatus />
          <div className="flex flex-col min-h-screen">{children}</div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
