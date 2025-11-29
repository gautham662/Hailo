
import { supabase } from "@/integrations/supabase/client";
import { RideStatus } from "./types";
import { fetchDriverInfo } from "./useDriverInfo";
import { useToast } from "@/hooks/use-toast";

export const setupRideSubscription = (
  rideId: string, 
  setRideStatus: (status: RideStatus) => void,
  setDriverInfo: (info: any) => void,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  console.log("Setting up enhanced real-time updates for ride:", rideId);
  
  // Enable realtime explicitly with proper type casting
  try {
    supabase.rpc('enable_realtime_for_table', { table: 'ride_requests' } as any);
    console.log("Realtime explicitly enabled for ride_requests table");
  } catch (error) {
    console.error("Error enabling realtime:", error);
  }
  
  const channel = supabase
    .channel(`rider_ride_updates_${rideId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'ride_requests',
        filter: `id=eq.${rideId}`
      },
      (payload) => {
        console.log("Rider received real-time update:", payload);
        const updatedRide = payload.new;
        const newStatus = updatedRide.status;
        
        if (newStatus === 'accepted') {
          setRideStatus('driverAssigned');
          toast({
            title: "Driver Found!",
            description: "A driver has accepted your ride request.",
            duration: 5000,
          });
          if (updatedRide.driver_id) {
            fetchDriverInfo(updatedRide.driver_id).then(setDriverInfo);
          }
        } else if (newStatus === 'in_progress') {
          setRideStatus('inProgress');
          toast({
            title: "Ride Started",
            description: "Your ride is now in progress.",
            duration: 5000,
          });
        } else if (newStatus === 'completed') {
          setRideStatus('completed');
          toast({
            title: "Ride Completed",
            description: "Your ride has been completed.",
            duration: 5000,
          });
        } else if (newStatus === 'cancelled') {
          setRideStatus('idle');
          toast({
            title: "Ride Cancelled",
            description: "Your ride has been cancelled.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    )
    .subscribe((status) => {
      console.log(`Rider ride subscription ${rideId} status:`, status);
    });
    
  return channel;
};
