import { Suspense } from 'react';
import { MarketplacePage } from '@/components/marketplace/MarketplacePage';

function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg text-gray-600">Loading marketplace...</div>
    </div>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={<MarketplaceLoading />}>
      <MarketplacePage />
    </Suspense>
  );
}
