
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import LocationSearch from "@/components/rider/LocationSearch";
import RideDetails from "@/components/rider/RideDetails";
import { Location } from "./utils/locationUtils";
import { RideStatus } from "./hooks/useRideState";

interface RideFormProps {
  rideStatus: RideStatus;
  pickup: Location | null;
  dropoff: Location | null;
  driverInfo?: {
    name: string;
    rating: number;
    vehicle: string;
    vehicleColor: string;
    arrivalTime: string;
  };
  estimatedFare: number;
  onLocationSelect: (type: "pickup" | "dropoff", location: Location) => void;
  onRequestRide: () => void;
  onCancelRide: () => void;
  onConfirmPickup: () => void;
  onConfirmDropoff: () => void;
  onCompleteRide: () => void;
}

const RideForm = ({
  rideStatus,
  pickup,
  dropoff,
  driverInfo,
  estimatedFare,
  onLocationSelect,
  onRequestRide,
  onCancelRide,
  onConfirmPickup,
  onConfirmDropoff,
  onCompleteRide
}: RideFormProps) => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">Find a Ride</CardTitle>
      </CardHeader>
      <CardContent>
        {rideStatus === "idle" ? (
          <div className="space-y-4">
            <LocationSearch 
              label="Pickup Location"
              icon={<MapPin className="h-5 w-5 text-gray-500" />}
              onLocationSelect={(location) => onLocationSelect("pickup", location)}
              placeholder="Current location"
              defaultLocation={pickup}
            />
            
            <LocationSearch 
              label="Destination"
              icon={<Navigation className="h-5 w-5 text-gray-500" />}
              onLocationSelect={(location) => onLocationSelect("dropoff", location)}
              placeholder="Where are you going?"
              defaultLocation={dropoff}
            />
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
              size="lg"
              onClick={onRequestRide}
              disabled={!pickup || !dropoff}
            >
              Request Ride
            </Button>
          </div>
        ) : (
          <RideDetails 
            rideStatus={rideStatus}
            pickup={pickup}
            dropoff={dropoff}
            driverInfo={driverInfo || (rideStatus !== "searching" ? {
              name: "Driver",
              rating: 4.8,
              vehicle: "Honda Activa",
              vehicleColor: "Blue",
              arrivalTime: "5 min"
            } : undefined)}
            onCancel={onCancelRide}
            onConfirmPickup={onConfirmPickup}
            onConfirmDropoff={onConfirmDropoff}
            onComplete={onCompleteRide}
            estimatedFare={estimatedFare}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RideForm;
