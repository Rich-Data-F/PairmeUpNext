'use client';

import { Suspense } from 'react';
import { SearchPage } from '@/components/search/SearchPage';

export default function Search() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SearchPage />
    </Suspense>
  );
}
