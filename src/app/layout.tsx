
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { NetworkStatus } from '@/components/NetworkStatus';

export const metadata: Metadata = {
  title: 'The Exchange | Premium Verified Marketplace',
  description: 'Verified Sellers, Secure Deals, No Scams, Just Good Trades.',
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-accent/20 selection:text-accent overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <FirebaseClientProvider>
          <NetworkStatus />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
