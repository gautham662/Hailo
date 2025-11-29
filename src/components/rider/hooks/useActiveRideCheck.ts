
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateDestinationCoordinates } from "../utils/locationUtils";
import { Location, RideStatus } from "./types";
import { setupRideSubscription } from "./useRideSubscription";
import { fetchDriverInfo } from "./useDriverInfo";
import { Json } from "@/integrations/supabase/types";

export const useActiveRideCheck = (
  setRideStatus: (status: RideStatus) => void,
  setPickup: (location: Location | null) => void,
  setDropoff: (location: Location | null) => void,
  setCurrentRideId: (id: string | null) => void,
  setDriverInfo: (info: any) => void,
  setEstimatedFare: (fare: number) => void,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Not logged in",
          description: "Please sign in to use the rider dashboard",
          variant: "destructive",
        });
        return;
      }

      console.log("Checking for active ride requests for user:", data.session.user.id);
      
      const { data: rideRequests, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('rider_id', data.session.user.id)
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching ride requests:", error);
        return;
      }

      console.log("Active ride requests:", rideRequests);

      if (rideRequests && rideRequests.length > 0) {
        const activeRide = rideRequests[0];
        setCurrentRideId(activeRide.id);
        
        let riderLongitude = 77.2090;
        let riderLatitude = 28.6139;
        
        if (activeRide.rider_location && typeof activeRide.rider_location === 'object' && !Array.isArray(activeRide.rider_location)) {
          const locationData = activeRide.rider_location as Record<string, Json>;
          riderLongitude = typeof locationData.longitude === 'number' ? locationData.longitude : riderLongitude;
          riderLatitude = typeof locationData.latitude === 'number' ? locationData.latitude : riderLatitude;
        }
        
        setPickup({
          name: activeRide.pickup_location,
          coordinates: [riderLongitude, riderLatitude]
        });
        
        const dropoffCoordinates = calculateDestinationCoordinates(riderLongitude, riderLatitude, activeRide.destination);
        
        setDropoff({
          name: activeRide.destination,
          coordinates: dropoffCoordinates
        });

        setEstimatedFare(activeRide.estimated_price);

        console.log("Active ride status:", activeRide.status);
        
        switch(activeRide.status) {
          case 'pending':
            setRideStatus('searching');
            break;
          case 'accepted':
            setRideStatus('driverAssigned');
            if (activeRide.driver_id) {
              fetchDriverInfo(activeRide.driver_id).then(setDriverInfo);
            }
            break;
          case 'in_progress':
            setRideStatus('inProgress');
            if (activeRide.driver_id) {
              fetchDriverInfo(activeRide.driver_id).then(setDriverInfo);
            }
            break;
          default:
            setRideStatus('idle');
        }
        
        // Set up subscription for this ride
        setupRideSubscription(activeRide.id, setRideStatus, setDriverInfo, toast);
      }
    };
    
    checkAuth();
  }, [setRideStatus, setPickup, setDropoff, setCurrentRideId, setDriverInfo, setEstimatedFare, toast]);
};
