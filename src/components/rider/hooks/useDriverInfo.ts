
import { supabase } from "@/integrations/supabase/client";

export const fetchDriverInfo = async (driverId: string) => {
  console.log("Fetching driver info for driver:", driverId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', driverId)
    .single();

  if (error) {
    console.error("Error fetching driver info:", error);
    return {
      name: "Driver",
      rating: 4.8,
      vehicle: "Honda Activa",
      vehicleColor: "Blue",
      arrivalTime: "5 min"
    };
  }

  if (data) {
    console.log("Driver info retrieved:", data);
    return {
      name: data.full_name || "Driver",
      rating: 4.8,
      vehicle: "Honda Activa",
      vehicleColor: "Blue",
      arrivalTime: "5 min"
    };
  }

  return {
    name: "Driver",
    rating: 4.8,
    vehicle: "Honda Activa",
    vehicleColor: "Blue",
    arrivalTime: "5 min"
  };
};
