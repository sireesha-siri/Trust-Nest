import { CityServiceItem, ServiceCategory } from '../types/city';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (accurate to within 0.5% for local distances).
 * 
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers, rounded to 1 decimal place
 */
export function calculateDistanceKm(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 0;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * 
    Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10;
}

export interface NearestServiceResult {
  service: CityServiceItem;
  distanceKm: number;
}

/**
 * Returns the closest civic service for each specified category relative to a property's coordinates.
 */
export function findNearestServices(
  propLat: number,
  propLng: number,
  services: CityServiceItem[]
): Record<ServiceCategory, NearestServiceResult | null> {
  const result: Record<ServiceCategory, NearestServiceResult | null> = {
    hospital: null,
    police: null,
    metro: null,
    pharmacy: null,
    grocery: null,
    bus_stop: null,
  };

  if (!propLat || !propLng || isNaN(propLat) || isNaN(propLng)) {
    return result;
  }

  for (const item of services) {
    if (!item.coordinates?.lat || !item.coordinates?.lng) continue;
    
    const dist = calculateDistanceKm(
      propLat, 
      propLng, 
      item.coordinates.lat, 
      item.coordinates.lng
    );

    const currentBest = result[item.category];
    if (!currentBest || dist < currentBest.distanceKm) {
      result[item.category] = {
        service: item,
        distanceKm: dist,
      };
    }
  }

  return result;
}
