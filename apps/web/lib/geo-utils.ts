/**
 * Location randomization utility for privacy.
 * Displaces a point by a random amount within a given radius.
 */
export function fuzzCoordinate(coord: number, radiusMeters: number): number {
  // Rough approximation: 1 degree latitude = 111,320m
  const degreeOffset = (Math.random() - 0.5) * (radiusMeters / 111320);
  return coord + degreeOffset;
}

/**
 * Returns a fuzzed LatLng if precision is set, otherwise returns original.
 */
export function getFuzzedLocation(lat: number, lng: number, precisionMeters: number = 500) {
  return {
    lat: fuzzCoordinate(lat, precisionMeters),
    lng: fuzzCoordinate(lng, precisionMeters),
    precision: precisionMeters
  };
}
