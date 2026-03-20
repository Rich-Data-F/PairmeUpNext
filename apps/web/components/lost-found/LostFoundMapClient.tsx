'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import L, { type DivIcon, type LatLngExpression } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LostFoundMapProps, LostFoundMapReport } from './LostFoundMap';

const DEFAULT_CENTER: LatLngExpression = [48.8566, 2.3522];
const DEFAULT_ZOOM = 4;

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

function getMarkerPalette(type?: string, primaryIntent?: string) {
  const ring = primaryIntent === 'SELLING' ? '#15803d' : '#b91c1c';

  switch (type) {
    case 'EARBUD_LEFT':
      return { background: '#2563eb', foreground: '#ffffff', ring };
    case 'EARBUD_RIGHT':
      return { background: '#7c3aed', foreground: '#ffffff', ring };
    case 'CHARGING_CASE':
      return { background: '#d97706', foreground: '#ffffff', ring };
    case 'EARBUD_PAIR':
      return { background: '#0f766e', foreground: '#ffffff', ring };
    case 'FULL_SET':
      return { background: '#334155', foreground: '#ffffff', ring };
    default:
      return { background: '#475569', foreground: '#ffffff', ring };
  }
}

function createMarkerIcon(report: LostFoundMapReport): DivIcon {
  const label = getMarkerLabel(report.type);
  const palette = getMarkerPalette(report.type, report.primaryIntent);

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
        border: 3px solid ${palette.ring};
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
}: LostFoundMapProps) {
  const mappedReports = useMemo(
    () =>
      reports
        .map((report) => ({ report, coordinates: getCoordinates(report) }))
        .filter(
          (entry): entry is { report: LostFoundMapReport; coordinates: [number, number] } =>
            entry.coordinates !== null
        ),
    [reports]
  );

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
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{mapLegendLabel}</div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-700" /> {mapLegendLostLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-700" /> {mapLegendFoundLabel}
            </span>
            <span className="font-medium text-gray-500">{mapLegendTypesLabel}: L / R / C / LR / SET</span>
          </div>
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
          {mappedReports.map(({ report, coordinates }) => (
            <Marker key={report.id} position={coordinates} icon={createMarkerIcon(report)}>
              <Popup>
                <div className="min-w-[220px] space-y-2">
                  <div className="text-sm font-semibold text-gray-900">{report.title || 'Untitled report'}</div>
                  <div className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: report.primaryIntent === 'SELLING' ? '#15803d' : '#b91c1c' }}>
                    {report.primaryIntent === 'SELLING' ? foundItemLabel : lostItemLabel}
                  </div>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div>
                      <span className="font-semibold">{brandModelLabel}:</span>{' '}
                      {report.brand?.name || ''} {report.model?.name || ''}
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
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
