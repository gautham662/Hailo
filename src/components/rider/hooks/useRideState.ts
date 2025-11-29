
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RideStatus, Location, DriverInfo } from "./types";
import { setupRideSubscription } from "./useRideSubscription";
import { useActiveRideCheck } from "./useActiveRideCheck";

export const useRideState = () => {
  const [rideStatus, setRideStatus] = useState<RideStatus>("idle");
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [estimatedFare, setEstimatedFare] = useState<number>(0);
  const { toast } = useToast();

  // Check for active rides when the component mounts
  useActiveRideCheck(
    setRideStatus,
    setPickup,
    setDropoff,
    setCurrentRideId,
    setDriverInfo,
    setEstimatedFare,
    toast
  );

  // Set up real-time subscription when currentRideId changes
  useEffect(() => {
    if (!currentRideId) return;

    console.log("Setting up real-time subscription for current ride:", currentRideId);
    
    const channel = setupRideSubscription(currentRideId, setRideStatus, setDriverInfo, toast);

    return () => {
      console.log("Cleaning up real-time subscription for ride:", currentRideId);
      supabase.removeChannel(channel);
    };
  }, [currentRideId, toast]);

  return {
    rideStatus,
    setRideStatus,
    pickup,
    setPickup,
    dropoff,
    setDropoff,
    currentRideId,
    setCurrentRideId,
    driverInfo,
    setDriverInfo,
    estimatedFare,
    setEstimatedFare
  };
};
