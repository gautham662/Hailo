
import { supabase } from "@/integrations/supabase/client";
import { DriverStatus, RideRequest } from "../utils/driverUtils";
import { Dispatch, SetStateAction } from "react";

export const toggleDriverStatus = async (
  isOnline: boolean, 
  setIsOnline: (status: boolean) => void,
  setDriverStatus: Dispatch<SetStateAction<DriverStatus>>,
  fetchAvailableRides: () => Promise<void>,
  toast: any
) => {
  if (!isOnline) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast({
        title: "Not logged in",
        description: "Please sign in to use the driver dashboard",
        variant: "destructive",
      });
      return;
    }
    
    setIsOnline(true);
    setDriverStatus("online");
    toast({
      title: "You're Online",
      description: "You'll start receiving ride requests.",
      duration: 5000,
    });
    
    fetchAvailableRides();
  } else {
    setIsOnline(false);
    setDriverStatus("offline");
    toast({
      title: "You're Offline",
      description: "You won't receive new ride requests.",
      duration: 5000,
    });
  }
};

export const acceptRide = async (
  ride: RideRequest,
  setCurrentRide: (ride: RideRequest) => void,
  setCurrentRideId: (id: string) => void,
  setRideRequests: (requests: RideRequest[]) => void,
  setDriverStatus: Dispatch<SetStateAction<DriverStatus>>,
  toast: any
) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      toast({
        title: "Not logged in",
        description: "Please sign in to accept rides",
        variant: "destructive",
      });
      return;
    }
    
    const driverLocation: Record<string, number> = {
      longitude: 77.2090,
      latitude: 28.6139
    };
    
    console.log("Accepting ride with ID:", ride.id);
    
    // Enable realtime explicitly with proper type casting
    try {
      await supabase.rpc('enable_realtime_for_table', { table: 'ride_requests' } as any);
      console.log("Realtime notifications enabled for ride_requests table");
    } catch (error) {
      console.error("Error enabling realtime:", error);
    }
    
    console.log("Updating ride in database to accepted status...");
    // Update the ride with driver information
    const { error } = await supabase
      .from('ride_requests')
      .update({
        driver_id: session.session.user.id,
        status: 'accepted',
        driver_location: driverLocation
      })
      .eq('id', ride.id);

    if (error) {
      throw error;
    }
    
    console.log("Ride accepted successfully, database updated");

    setCurrentRide(ride);
    setCurrentRideId(ride.id);
    setRideRequests([]);
    setDriverStatus("rideAccepted");
    
    // Set up subscription to track this specific ride
    setupRideSubscription(ride.id, setDriverStatus, toast);
    
    toast({
      title: "Ride Accepted",
      description: `Navigating to pick up ${ride.rider.name}`,
      duration: 5000,
    });
  } catch (error) {
    console.error("Error accepting ride:", error);
    toast({
      title: "Error",
      description: "Failed to accept ride. Please try again.",
      variant: "destructive",
    });
  }
};

// Helper function to set up subscription for a specific ride
const setupRideSubscription = (
  rideId: string, 
  setDriverStatus: Dispatch<SetStateAction<DriverStatus>>,
  toast: any
) => {
  const channel = supabase
    .channel(`driver_ride_updates_${rideId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'ride_requests',
        filter: `id=eq.${rideId}`
      },
      (payload) => {
        console.log("Driver received update for ride:", payload);
        const newStatus = payload.new.status;
        
        if (newStatus === 'in_progress') {
          setDriverStatus('inProgress');
          toast({
            title: "Ride Started",
            description: "The rider has confirmed pickup. Ride in progress.",
            duration: 3000,
          });
        } else if (newStatus === 'completed') {
          setDriverStatus('completed');
          toast({
            title: "Ride Completed",
            description: "The ride has been completed.",
            duration: 3000,
          });
        } else if (newStatus === 'cancelled') {
          setDriverStatus('online');
          toast({
            title: "Ride Cancelled",
            description: "The rider has cancelled this ride.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    )
    .subscribe((status) => {
      console.log(`Driver ride subscription ${rideId} status:`, status);
    });
    
  return channel;
};

export const declineRide = (
  rideId: string, 
  rideRequests: RideRequest[], 
  setRideRequests: (requests: RideRequest[]) => void,
  toast: any
) => {
  setRideRequests(rideRequests.filter((ride) => ride.id !== rideId));
  
  toast({
    description: "Ride request declined",
    duration: 3000,
  });
};

export const confirmPickup = async (
  currentRideId: string | null, 
  setDriverStatus: Dispatch<SetStateAction<DriverStatus>>,
  toast: any
) => {
  if (!currentRideId) return;
  
  try {
    console.log("Confirming pickup for ride:", currentRideId);
    
    // Add a small delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { error } = await supabase
      .from('ride_requests')
      .update({ status: 'in_progress' })
      .eq('id', currentRideId);

    if (error) {
      throw error;
    }
    
    console.log("Pickup confirmed successfully, status updated to in_progress");

    setDriverStatus("inProgress");
    
    toast({
      title: "Pickup Confirmed",
      description: "Ride is now in progress",
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

export const completeRide = async (
  currentRideId: string | null, 
  setDriverStatus: Dispatch<SetStateAction<DriverStatus>>,
  toast: any
) => {
  if (!currentRideId) return;
  
  try {
    console.log("Completing ride:", currentRideId);
    
    // Add a small delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { error } = await supabase
      .from('ride_requests')
      .update({ status: 'completed' })
      .eq('id', currentRideId);

    if (error) {
      throw error;
    }
    
    console.log("Ride completed successfully, status updated to completed");

    setDriverStatus("completed");
    
    toast({
      title: "Ride Completed",
      description: "Thank you for driving with Hailo!",
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
