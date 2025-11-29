
import { toast } from "@/hooks/use-toast";

export interface Location {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export const calculateDestinationCoordinates = (
  pickupLng: number,
  pickupLat: number,
  destinationName: string
): [number, number] => {
  let hash = 0;
  for (let i = 0; i < destinationName.length; i++) {
    hash = ((hash << 5) - hash) + destinationName.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const offsetLngFactor = (Math.abs(hash % 100) / 100) * 0.015 + 0.005;
  const offsetLatFactor = (Math.abs((hash >> 8) % 100) / 100) * 0.015 + 0.005;
  
  const lngDirection = hash % 2 === 0 ? 1 : -1;
  const latDirection = (hash >> 1) % 2 === 0 ? 1 : -1;
  
  return [
    pickupLng + (offsetLngFactor * lngDirection),
    pickupLat + (offsetLatFactor * latDirection)
  ];
};

export const calculateFare = (
  pickupCoords: [number, number],
  dropoffCoords: [number, number]
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const lat1 = pickupCoords[1];
  const lon1 = pickupCoords[0];
  const lat2 = dropoffCoords[1];
  const lon2 = dropoffCoords[0];
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  const baseFare = 20;
  const distanceFare = Math.round(distance * 15);
  
  return baseFare + distanceFare;
};
