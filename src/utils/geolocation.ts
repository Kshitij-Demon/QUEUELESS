/**
 * Geolocation utility for distance calculation and 5-minute radius detection
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// SmileCare Dental Clinic coordinates (Medical Center Atrium)
export const VENUE_COORDINATES: Coordinates = {
  latitude: 37.774929,
  longitude: -122.419416,
};

// 5-minute walking radius corresponds to ~400-500 meters (walking at 5 km/h ≈ 83 m/min)
export const FIVE_MINUTE_RADIUS_METERS = 500;

/**
 * Calculates Haversine distance in meters between two GPS coordinates
 */
export function calculateDistanceMeters(
  coord1: Coordinates,
  coord2: Coordinates = VENUE_COORDINATES
): number {
  const R = 6371e3; // Earth's radius in meters
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLatRad = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLonRad = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Estimates walking transit time in minutes based on distance in meters
 */
export function estimateWalkingMinutes(meters: number): number {
  const metersPerMinute = 83; // ~5 km/h
  return Math.max(1, Math.round(meters / metersPerMinute));
}
