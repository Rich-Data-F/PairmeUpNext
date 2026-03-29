'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import L, { type DivIcon, type LatLngExpression } from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LostFoundMapProps, LostFoundMapReport, MapCategory, MapItemType } from './LostFoundMap';

const DEFAULT_CENTER: LatLngExpression = [48.8566, 2.3522];
const DEFAULT_ZOOM = 4;

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getItemType(report: LostFoundMapReport): MapItemType {
  // If itemType is explicitly set, use it
  if (report.itemType) return report.itemType;
  
  // Otherwise infer from price: if price is 0, it's a lost/found report; otherwise it's a classified ad
  const price = toNumber(report.price);
  return price === 0 ? 'lost-found' : 'classified';
}

function getCategory(report: LostFoundMapReport): MapCategory {
  const itemType = getItemType(report);
  if (itemType === 'lost-found') {
    return report.primaryIntent === 'SELLING' ? 'found' : 'lost';
  } else {
    return report.primaryIntent === 'SELLING' ? 'selling' : 'buying';
  }
}

function shouldShowReport(report: LostFoundMapReport, selectedCategory: MapCategory): boolean {
  if (selectedCategory === 'all') return true;
  const category = getCategory(report);
  return category === selectedCategory;
}

function getCoordinates(report: LostFoundMapReport): [number, number] | null {
  const latitude =
    toNumber(report.location?.latitude) ??
    toNumber(report.latitude) ??
    toNumber(report.city?.latitude);
  const longitude =
    toNumber(report.location?.longitude) ??
    toNumber(report.longitude) ??
    toNumber(report.city?.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  return [latitude, longitude];
}

function getMarkerLabel(type?: string) {
  switch (type) {
    case 'EARBUD_LEFT':
      return 'L';
    case 'EARBUD_RIGHT':
      return 'R';
    case 'CHARGING_CASE':
      return 'C';
    case 'EARBUD_PAIR':
      return 'LR';
    case 'FULL_SET':
      return 'SET';
    default:
      return '?';
  }
}

function getMarkerPalette(type?: string, primaryIntent?: string, itemType?: MapItemType) {
  // For classified ads (non-registry items), use different colors
  if (itemType === 'classified') {
    const ring = primaryIntent === 'SELLING' ? '#059669' : '#0891b2';
    switch (type) {
      case 'EARBUD_LEFT':
        return { background: '#1f2937', foreground: '#ffffff', ring, border: 2 };
      case 'EARBUD_RIGHT':
        return { background: '#1f2937', foreground: '#ffffff', ring, border: 2 };
      case 'CHARGING_CASE':
        return { background: '#1f2937', foreground: '#ffffff', ring, border: 2 };
      case 'EARBUD_PAIR':
        return { background: '#1f2937', foreground: '#ffffff', ring, border: 2 };
      case 'FULL_SET':
        return { background: '#1f2937', foreground: '#ffffff', ring, border: 2 };
      default:
        return { background: '#1f2937', foreground: '#ffffff', ring, border: 2 };
    }
  }

  // For lost/found items (registry), keep original colors
  const ring = primaryIntent === 'SELLING' ? '#15803d' : '#b91c1c';

  switch (type) {
    case 'EARBUD_LEFT':
      return { background: '#2563eb', foreground: '#ffffff', ring, border: 3 };
    case 'EARBUD_RIGHT':
      return { background: '#7c3aed', foreground: '#ffffff', ring, border: 3 };
    case 'CHARGING_CASE':
      return { background: '#d97706', foreground: '#ffffff', ring, border: 3 };
    case 'EARBUD_PAIR':
      return { background: '#0f766e', foreground: '#ffffff', ring, border: 3 };
    case 'FULL_SET':
      return { background: '#334155', foreground: '#ffffff', ring, border: 3 };
    default:
      return { background: '#475569', foreground: '#ffffff', ring, border: 3 };
  }
}

function createMarkerIcon(report: LostFoundMapReport): DivIcon {
  const label = getMarkerLabel(report.type);
  const itemType = getItemType(report);
  const palette = getMarkerPalette(report.type, report.primaryIntent, itemType);

  return L.divIcon({
    className: 'lost-found-map-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${palette.background};
        color: ${palette.foreground};
        border: ${palette.border}px solid ${palette.ring};
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
        font-weight: 800;
        font-size: 12px;
        letter-spacing: 0.04em;
      ">${label}</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }

    map.fitBounds(points, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

export function LostFoundMapClient({
  reports,
  emptyTitle,
  emptyDescription,
  viewDetailsLabel,
  brandModelLabel,
  datePostedLabel,
  locationLabel,
  foundItemLabel,
  lostItemLabel,
  mapLegendLabel,
  mapLegendLostLabel,
  mapLegendFoundLabel,
  mapLegendTypesLabel,
  mapAvailableCountLabel,
  onCategoryChange,
  selectedCategory = 'all',
  sellingLabel = 'Selling',
  buyingLabel = 'Buying',
  allLabel = 'All',
  classifiedLabel = 'Classified',
}: LostFoundMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [localCategory, setLocalCategory] = useState<MapCategory>(selectedCategory);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setLocalCategory(selectedCategory);
  }, [selectedCategory]);

  const mappedReports = useMemo(
    () =>
      reports
        .filter((report) => shouldShowReport(report, localCategory))
        .map((report) => ({
          report,
          coordinates: getCoordinates(report),
        }))
        .filter(
          (entry): entry is { report: LostFoundMapReport; coordinates: [number, number] } =>
            entry.coordinates !== null
        ),
    [reports, localCategory]
  );

  const handleCategoryChange = (category: MapCategory) => {
    setLocalCategory(category);
    onCategoryChange?.(category);
  };

  if (!isClient) {
    return (
      <div className="flex h-[560px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 shadow-md">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-sm font-medium text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (mappedReports.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-gray-600">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <div className="text-sm font-semibold text-gray-900">{mapLegendLabel}</div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-700" /> {mapLegendLostLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-700" /> {mapLegendFoundLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-700 border-2 border-cyan-500" />
              {buyingLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-700 border-2 border-emerald-500" />
              {sellingLabel}
            </span>
            <span className="font-medium text-gray-500">{mapLegendTypesLabel}: L / R / C / LR / SET</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              localCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {allLabel}
          </button>
          <button
            onClick={() => handleCategoryChange('lost')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              localCategory === 'lost'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {mapLegendLostLabel}
          </button>
          <button
            onClick={() => handleCategoryChange('found')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              localCategory === 'found'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {mapLegendFoundLabel}
          </button>
          <button
            onClick={() => handleCategoryChange('buying')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              localCategory === 'buying'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {buyingLabel}
          </button>
          <button
            onClick={() => handleCategoryChange('selling')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              localCategory === 'selling'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {sellingLabel}
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {mappedReports.length} {mapAvailableCountLabel}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-[560px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={mappedReports.map((entry) => entry.coordinates)} />
          {mappedReports.map(({ report, coordinates }) => {
            const precision = toNumber(report.locationPrecision) || 0;
            const itemType = getItemType(report);
            const markerColor = itemType === 'classified' 
              ? (report.primaryIntent === 'SELLING' ? '#059669' : '#0891b2')
              : (report.primaryIntent === 'SELLING' ? '#15803d' : '#b91c1c');

            return (
              <React.Fragment key={report.id}>
                {precision > 0 && (
                  <Circle
                    center={coordinates}
                    radius={precision}
                    pathOptions={{
                      color: markerColor,
                      fillColor: markerColor,
                      fillOpacity: 0.15,
                      weight: 1,
                      dashArray: '5, 5',
                    }}
                  />
                )}
                <Marker position={coordinates} icon={createMarkerIcon(report)}>
                  <Popup>
                    <div className="min-w-[220px] space-y-2">
                      <div className="text-sm font-semibold text-gray-900">{report.title || 'Untitled report'}</div>
                      <div
                        className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                        style={{ backgroundColor: markerColor }}
                      >
                        {itemType === 'classified' 
                          ? (report.primaryIntent === 'SELLING' ? sellingLabel : buyingLabel)
                          : (report.primaryIntent === 'SELLING' ? foundItemLabel : lostItemLabel)
                        }
                      </div>
                      {itemType === 'classified' && report.price && (
                        <div className="text-sm font-semibold text-gray-900">
                          {Number(report.price).toFixed(2)} EUR
                        </div>
                      )}
                      <div className="space-y-1 text-xs text-gray-700">
                        <div>
                          <span className="font-semibold">{brandModelLabel}:</span> {report.brand?.name || ''}{' '}
                          {report.model?.name || ''}
                        </div>
                        <div>
                          <span className="font-semibold">{locationLabel}:</span>{' '}
                          {report.city?.displayName || `${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}`}
                        </div>
                        {report.createdAt ? (
                          <div>
                            <span className="font-semibold">{datePostedLabel}:</span>{' '}
                            {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        ) : null}
                      </div>
                      <Link
                        href={`/listings/${report.id}`}
                        className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        {viewDetailsLabel}
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
