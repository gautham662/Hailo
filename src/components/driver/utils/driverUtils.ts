
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface LocationData {
  longitude: number;
  latitude: number;
}

export interface RiderInfo {
  name: string;
  rating: number;
}

export interface RideRequest {
  id: string;
  rider: RiderInfo;
  pickup: {
    name: string;
    coordinates: [number, number];
  };
  dropoff: {
    name: string;
    coordinates: [number, number];
  };
  distance: string;
  fare: string;
  timestamp: Date;
}

export type DriverStatus = "offline" | "online" | "rideAccepted" | "pickingUp" | "inProgress" | "completed";

export const getMapMarkers = (driverStatus: DriverStatus, currentRide: RideRequest | null) => {
  const markers = [];
  
  if (driverStatus !== "offline") {
    markers.push({
      id: "driver",
      lngLat: [77.2090, 28.6139] as [number, number],
      type: "driver" as const,
    });
  }
  
  if (currentRide) {
    if (driverStatus === "rideAccepted" || driverStatus === "pickingUp") {
      markers.push({
        id: "pickup",
        lngLat: currentRide.pickup.coordinates,
        type: "pickup" as const,
      });
    }
    
    if (driverStatus === "inProgress" || driverStatus === "completed") {
      markers.push({
        id: "dropoff",
        lngLat: currentRide.dropoff.coordinates,
        type: "dropoff" as const,
      });
    }
  }
  
  return markers;
};

export const getRouteToDisplay = (driverStatus: DriverStatus, currentRide: RideRequest | null) => {
  if (!currentRide) return undefined;
  
  if (driverStatus === "rideAccepted" || driverStatus === "pickingUp") {
    return {
      start: [77.2090, 28.6139] as [number, number],
      end: currentRide.pickup.coordinates,
    };
  }
  
  if (driverStatus === "inProgress") {
    return {
      start: currentRide.pickup.coordinates,
      end: currentRide.dropoff.coordinates,
    };
  }
  
  return undefined;
};

export const fetchRiderInfo = async (riderId: string, formattedRide: RideRequest): Promise<RideRequest> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', riderId)
    .single();

  if (error) {
    console.error("Error fetching rider info:", error);
    return formattedRide;
  }

  if (data) {
    return {
      ...formattedRide,
      rider: {
        ...formattedRide.rider,
        name: data.full_name || "Rider"
      }
    };
  }
  
  return formattedRide;
};

export const formatRideRequest = (ride: any): RideRequest => {
  let riderLongitude = 77.2150;
  let riderLatitude = 28.6129;
  
  if (ride.rider_location && typeof ride.rider_location === 'object' && !Array.isArray(ride.rider_location)) {
    const locationData = ride.rider_location as Record<string, Json>;
    riderLongitude = typeof locationData.longitude === 'number' ? locationData.longitude : riderLongitude;
    riderLatitude = typeof locationData.latitude === 'number' ? locationData.latitude : riderLatitude;
  }
  
  return {
    id: ride.id,
    rider: {
      name: "Rider",
      rating: 4.7,
    },
    pickup: {
      name: ride.pickup_location,
      coordinates: [riderLongitude, riderLatitude]
    },
    dropoff: {
      name: ride.destination,
      coordinates: [77.2190, 28.6079]
    },
    distance: "2.3 km",
    fare: `₹${ride.estimated_price}`,
    timestamp: new Date(ride.created_at)
  };
};
