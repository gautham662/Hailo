
export interface MapMarker {
  id: string;
  lngLat: [number, number];
  type: "pickup" | "dropoff" | "driver";
}

export interface RouteCoordinates {
  start: [number, number];
  end: [number, number];
}

export interface Location {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export const getMapMarkers = (
  pickup: Location | null,
  dropoff: Location | null,
  rideStatus: string
): MapMarker[] => {
  const markers: MapMarker[] = [];
  
  if (pickup) {
    markers.push({
      id: "pickup",
      lngLat: pickup.coordinates,
      type: "pickup",
    });
  }
  
  if (dropoff) {
    markers.push({
      id: "dropoff",
      lngLat: dropoff.coordinates,
      type: "dropoff",
    });
  }
  
  if (rideStatus === "driverAssigned" || rideStatus === "enRoute") {
    const driverLng = pickup ? pickup.coordinates[0] - 0.005 : 0;
    const driverLat = pickup ? pickup.coordinates[1] - 0.005 : 0;
    
    markers.push({
      id: "driver",
      lngLat: [driverLng, driverLat],
      type: "driver",
    });
  }
  
  return markers;
};

export const getRouteToDisplay = (
  pickup: Location | null,
  dropoff: Location | null,
  rideStatus: string
): RouteCoordinates | undefined => {
  if (!pickup || !dropoff) return undefined;
  
  if (rideStatus === "driverAssigned" || rideStatus === "enRoute") {
    const driverLng = pickup.coordinates[0] - 0.005;
    const driverLat = pickup.coordinates[1] - 0.005;
    return {
      start: [driverLng, driverLat],
      end: pickup.coordinates,
    };
  }
  
  if (rideStatus === "inProgress") {
    return {
      start: pickup.coordinates,
      end: dropoff.coordinates,
    };
  }
  
  if (rideStatus === "idle" && pickup && dropoff) {
    return {
      start: pickup.coordinates,
      end: dropoff.coordinates,
    };
  }
  
  return undefined;
};
