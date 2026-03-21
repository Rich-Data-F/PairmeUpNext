'use client';

import dynamic from 'next/dynamic';

export type MapItemType = 'lost-found' | 'classified'; // lost-found for registry items, classified for regular listings
export type MapCategory = 'lost' | 'found' | 'selling' | 'buying' | 'all';

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
  locationPrecision?: number | string | null;
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
  // Item type for distinguishing lost/found vs classified
  itemType?: MapItemType;
  // Price to help determine if it's a classified ad (price > 0) or registry item (price = 0)
  price?: number | string | null;
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
  // New props for filters
  onCategoryChange?: (category: MapCategory) => void;
  selectedCategory?: MapCategory;
  sellingLabel?: string;
  buyingLabel?: string;
  allLabel?: string;
  classifiedLabel?: string;
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

