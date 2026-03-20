import { Suspense } from 'react';
import { LostStolenPage } from '@/components/lost-found/LostStolenPage';

export default function LostStolen() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    }>
      <LostStolenPage />
    </Suspense>
  );
}

export function generateMetadata() {
  return {
    title: 'Lost & Found Registry - EarbudHub',
    description: 'Report lost or stolen earbuds and help recover them through our secure registry.',
  };
}
