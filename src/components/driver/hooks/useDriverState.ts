
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DriverStatus, RideRequest, fetchRiderInfo, formatRideRequest } from "../utils/driverUtils";

export const useDriverState = () => {
  const [driverStatus, setDriverStatus] = useState<DriverStatus>("offline");
  const [isOnline, setIsOnline] = useState(false);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Not logged in",
          description: "Please sign in to use the driver dashboard",
          variant: "destructive",
        });
        return;
      }

      const { data: activeRides, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('driver_id', data.session.user.id)
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching active rides:", error);
        return;
      }

      if (activeRides && activeRides.length > 0) {
        const ride = activeRides[0];
        setIsOnline(true);
        setCurrentRideId(ride.id);
        
        const formattedRide = formatRideRequest(ride);
        setCurrentRide(formattedRide);
        
        if (ride.status === 'accepted') {
          setDriverStatus('rideAccepted');
        } else if (ride.status === 'in_progress') {
          setDriverStatus('inProgress');
        }
        
        fetchRiderInfo(ride.rider_id, formattedRide).then(updatedRide => {
          setCurrentRide(updatedRide);
        });
      }
    };
    
    checkAuth();
  }, [toast]);

  useEffect(() => {
    if (!isOnline || driverStatus !== "online") return;

    // Initial fetch when going online
    fetchAvailableRides();
    
    // Enable realtime for the ride_requests table with proper type casting
    const enableRealtime = async () => {
      try {
        await supabase.rpc('enable_realtime_for_table', { table: 'ride_requests' } as any);
        console.log("Realtime enabled:", true);
      } catch (error) {
        console.error("Error enabling realtime:", error);
      }
    };
    
    enableRealtime();
    
    // Set up subscription to ride_requests changes with better logging
    const channel = supabase
      .channel('driver_available_rides')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_requests',
          filter: `status=eq.pending`
        },
        async (payload) => {
          console.log("Ride request change detected:", payload);
          
          // Refresh the ride requests when a change is detected
          await fetchAvailableRides();
        }
      )
      .subscribe((status) => {
        console.log("Available rides subscription status:", status);
      });

    // Set up polling to periodically refresh available rides
    const intervalId = setInterval(() => {
      if (isOnline && driverStatus === "online") {
        fetchAvailableRides();
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      console.log("Cleaning up driver available rides subscription");
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [isOnline, driverStatus]);

  useEffect(() => {
    if (!currentRideId) return;

    console.log("Setting up driver's current ride subscription for:", currentRideId);

    const channel = supabase
      .channel('driver_current_ride')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ride_requests',
          filter: `id=eq.${currentRideId}`
        },
        (payload) => {
          const updatedRide = payload.new;
          console.log("Current ride updated:", updatedRide);
          
          if (updatedRide.status === 'in_progress' && driverStatus === 'rideAccepted') {
            console.log("Updating driver status to inProgress");
            setDriverStatus('inProgress');
            toast({
              title: "Ride Started",
              description: "The ride is now in progress.",
              duration: 3000,
            });
          } else if (updatedRide.status === 'completed') {
            console.log("Updating driver status to completed");
            setDriverStatus('completed');
            toast({
              title: "Ride Completed",
              description: "The ride has been completed.",
              duration: 3000,
            });
          } else if (updatedRide.status === 'cancelled') {
            toast({
              title: "Ride Cancelled",
              description: "The rider has cancelled this ride.",
              variant: "destructive",
              duration: 5000,
            });
            resetRideState();
          }
        }
      )
      .subscribe((status) => {
        console.log("Current ride subscription status:", status);
      });

    return () => {
      console.log("Cleaning up driver current ride subscription");
      supabase.removeChannel(channel);
    };
  }, [currentRideId, driverStatus, toast]);

  const fetchAvailableRides = async () => {
    try {
      console.log("Fetching available rides...");
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Available rides data:", data);

      if (data) {
        const formattedRequests: RideRequest[] = await Promise.all(data.map(async (ride) => {
          const formattedRide = formatRideRequest(ride);
          
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', ride.rider_id)
              .single();
              
            if (profileData) {
              formattedRide.rider.name = profileData.full_name || "Rider";
            }
          } catch (error) {
            console.error("Error fetching rider profile:", error);
          }
          
          return formattedRide;
        }));
        
        console.log("Formatted ride requests:", formattedRequests);
        setRideRequests(formattedRequests);
      }
    } catch (error) {
      console.error("Error fetching ride requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ride requests.",
        variant: "destructive",
      });
    }
  };

  const resetRideState = () => {
    setCurrentRide(null);
    setCurrentRideId(null);
    setDriverStatus("online");
    fetchAvailableRides();
  };

  return {
    driverStatus,
    setDriverStatus,
    isOnline,
    setIsOnline,
    rideRequests,
    setRideRequests,
    currentRide,
    setCurrentRide,
    currentRideId,
    setCurrentRideId,
    fetchAvailableRides,
    resetRideState,
    toast
  };
};
