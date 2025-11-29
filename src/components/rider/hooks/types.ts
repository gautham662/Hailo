
export type RideStatus = "idle" | "searching" | "driverAssigned" | "enRoute" | "arrived" | "inProgress" | "completed";

export interface Location {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface DriverInfo {
  name: string;
  rating: number;
  vehicle: string;
  vehicleColor: string;
  arrivalTime: string;
}
