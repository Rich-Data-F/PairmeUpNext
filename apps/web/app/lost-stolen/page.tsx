import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { LostStolenPage } from '@/components/lost-found/LostStolenPage';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

export default async function LostStolen() {
  const messages = (await import('@/messages/en.json')).default;

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        }>
          <LostStolenPage />
        </Suspense>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </NextIntlClientProvider>
  );
}

export function generateMetadata() {
  return {
    title: 'Lost & Found Registry - EarbudHub',
    description: 'Report lost or stolen earbuds and help recover them through our secure registry.',
  };
}
