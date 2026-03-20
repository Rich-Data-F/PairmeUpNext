'use client';

import dynamic from 'next/dynamic';

export interface LostFoundMapReport {
  id: string;
  title?: string;
  type?: string;
  primaryIntent?: 'SELLING' | 'BUYING' | 'TRADING' | string;
  createdAt?: string;
  location?: {
    latitude?: string | number | null;
    longitude?: string | number | null;
  };
  latitude?: string | number | null;
  longitude?: string | number | null;
  city?: {
    displayName?: string;
    latitude?: string | number | null;
    longitude?: string | number | null;
  };
  brand?: {
    name?: string;
  };
  model?: {
    name?: string;
  };
}

export interface LostFoundMapProps {
  reports: LostFoundMapReport[];
  emptyTitle: string;
  emptyDescription: string;
  viewDetailsLabel: string;
  brandModelLabel: string;
  datePostedLabel: string;
  locationLabel: string;
  foundItemLabel: string;
  lostItemLabel: string;
  mapLegendLabel: string;
  mapLegendLostLabel: string;
  mapLegendFoundLabel: string;
  mapLegendTypesLabel: string;
  mapAvailableCountLabel: string;
}

const LostFoundMapClient = dynamic<LostFoundMapProps>(
  () => import('./LostFoundMapClient').then((mod) => mod.LostFoundMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[560px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="text-sm font-medium text-gray-500">Loading map…</div>
      </div>
    ),
  }
);

export function LostFoundMap(props: LostFoundMapProps) {
  return <LostFoundMapClient {...props} />;
}
