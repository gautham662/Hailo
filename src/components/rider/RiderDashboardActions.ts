import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { calculateFare, Location } from "./utils/locationUtils";
import { Dispatch, SetStateAction } from "react";
import { RideStatus } from "./hooks/useRideState";

export const requestRide = async (
  pickup: Location | null,
  dropoff: Location | null,
  setRideStatus: Dispatch<SetStateAction<RideStatus>>,
  setEstimatedFare: (fare: number) => void,
  setCurrentRideId: (id: string | null) => void
) => {
  if (!pickup || !dropoff) {
    toast({
      title: "Missing Location",
      description: "Please select both pickup and dropoff locations.",
      variant: "destructive",
    });
    return;
  }

  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      toast({
        title: "Not logged in",
        description: "Please sign in to request a ride",
        variant: "destructive",
      });
      return;
    }

    setRideStatus("searching");

    const calculatedFare = calculateFare(pickup.coordinates, dropoff.coordinates);
    setEstimatedFare(calculatedFare);
    
    const riderLocation: Record<string, number> = { 
      longitude: pickup.coordinates[0], 
      latitude: pickup.coordinates[1] 
    };
    
    console.log("Creating ride request with fare:", calculatedFare);
    
    // Enable realtime explicitly with proper type casting
    try {
      await supabase.rpc('enable_realtime_for_table', { table: 'ride_requests' } as any);
      console.log("Realtime enabled for ride_requests table");
    } catch (error) {
      console.error("Error enabling realtime:", error);
    }
    
    const { data, error } = await supabase
      .from('ride_requests')
      .insert({
        rider_id: session.session.user.id,
        pickup_location: pickup.name,
        destination: dropoff.name,
        rider_location: riderLocation,
        estimated_price: calculatedFare,
        estimated_time: 5,
        ride_type: 'standard',
        status: 'pending'
      })
      .select();

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      console.log("Ride request created:", data[0]);
      setCurrentRideId(data[0].id);
      
      // Set up subscription for this specific ride request
      setupRideSubscription(data[0].id, setRideStatus);
    }

    toast({
      title: "Ride Requested",
      description: "Looking for drivers near you...",
      duration: 5000,
    });
  } catch (error) {
    console.error("Error creating ride request:", error);
    toast({
      title: "Error",
      description: "Failed to create ride request. Please try again.",
      variant: "destructive",
    });
    setRideStatus("idle");
  }
};

const setupRideSubscription = (rideId: string, setRideStatus: Dispatch<SetStateAction<RideStatus>>) => {
  const channel = supabase
    .channel(`ride_updates_${rideId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'ride_requests',
        filter: `id=eq.${rideId}`
      },
      (payload) => {
        console.log("Rider received update for ride:", payload);
        const newStatus = payload.new.status;
        
        if (newStatus === 'accepted') {
          setRideStatus('driverAssigned');
          toast({
            title: "Driver Found!",
            description: "A driver has accepted your ride request.",
            duration: 5000,
          });
        }
      }
    )
    .subscribe((status) => {
      console.log(`Ride subscription ${rideId} status:`, status);
    });
    
  return channel;
};

export const cancelRide = async (
  currentRideId: string | null,
  setCurrentRideId: (id: string | null) => void,
  setRideStatus: Dispatch<SetStateAction<RideStatus>>
) => {
  if (!currentRideId) {
    setRideStatus("idle");
    return;
  }

  try {
    const { error } = await supabase
      .from('ride_requests')
      .update({ status: 'cancelled' })
      .eq('id', currentRideId);

    if (error) {
      throw error;
    }

    setCurrentRideId(null);
    setRideStatus("idle");
    toast({
      title: "Ride Cancelled",
      description: "Your ride request has been cancelled.",
      duration: 5000,
    });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    toast({
      title: "Error",
      description: "Failed to cancel ride. Please try again.",
      variant: "destructive",
    });
  }
};

export const confirmPickup = async (
  currentRideId: string | null,
  setRideStatus: Dispatch<SetStateAction<RideStatus>>
) => {
  if (!currentRideId) return;

  try {
    const { error } = await supabase
      .from('ride_requests')
      .update({ status: 'in_progress' })
      .eq('id', currentRideId);

    if (error) {
      throw error;
    }

    setRideStatus("inProgress");
    console.log("Ride status updated to in_progress");
    toast({
      title: "Ride Started",
      description: "Your ride is now in progress.",
      duration: 3000,
    });
  } catch (error) {
    console.error("Error updating ride status:", error);
    toast({
      title: "Error",
      description: "Failed to update ride status. Please try again.",
      variant: "destructive",
    });
  }
};

export const confirmDropoff = async (
  currentRideId: string | null,
  setRideStatus: Dispatch<SetStateAction<RideStatus>>
) => {
  if (!currentRideId) return;

  try {
    const { error } = await supabase
      .from('ride_requests')
      .update({ status: 'completed' })
      .eq('id', currentRideId);

    if (error) {
      throw error;
    }

    setRideStatus("completed");
    console.log("Ride status updated to completed");
    toast({
      title: "Ride Completed",
      description: "Your ride has been completed successfully.",
      duration: 3000,
    });
  } catch (error) {
    console.error("Error completing ride:", error);
    toast({
      title: "Error",
      description: "Failed to complete ride. Please try again.",
      variant: "destructive",
    });
  }
};
