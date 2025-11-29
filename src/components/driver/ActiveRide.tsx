
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Navigation, Star } from "lucide-react";
import { RideRequest, DriverStatus } from "./utils/driverUtils";
import { useToast } from "@/hooks/use-toast";

interface ActiveRideProps {
  currentRide: RideRequest;
  driverStatus: DriverStatus;
  onConfirmPickup: () => void;
  onCompleteRide: () => void;
  onFindNewRides: () => void;
}

const ActiveRide = ({ 
  currentRide, 
  driverStatus, 
  onConfirmPickup, 
  onCompleteRide, 
  onFindNewRides 
}: ActiveRideProps) => {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      {driverStatus === "rideAccepted" && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-blue-800 font-medium text-center">Pickup the rider</p>
        </div>
      )}
      
      {driverStatus === "inProgress" && (
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-green-800 font-medium text-center">Ride in progress</p>
        </div>
      )}
      
      {driverStatus === "completed" && (
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-purple-800 font-medium text-center">Ride completed</p>
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-800 font-semibold">{currentRide.rider.name.charAt(0)}</span>
          </div>
          <div>
            <h4 className="font-medium">{currentRide.rider.name}</h4>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{currentRide.rider.rating}</span>
            </div>
          </div>
        </div>
        
        <Button 
          size="icon" 
          variant="outline" 
          className="rounded-full h-8 w-8"
          onClick={() => {
            toast({
              title: "Calling rider",
              description: "Connecting you to the rider...",
            });
          }}
        >
          <Phone className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Pickup</p>
            <p className="text-sm">{currentRide.pickup.name}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Navigation className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Dropoff</p>
            <p className="text-sm">{currentRide.dropoff.name}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center border-t pt-3">
        <div>
          <p className="text-xs text-gray-500">Fare</p>
          <p className="font-semibold">{currentRide.fare}</p>
        </div>
        
        {driverStatus === "rideAccepted" && (
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onConfirmPickup}
          >
            Confirm Pickup
          </Button>
        )}
        
        {driverStatus === "inProgress" && (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onCompleteRide}
          >
            Complete Ride
          </Button>
        )}
        
        {driverStatus === "completed" && (
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={onFindNewRides}
          >
            Find New Rides
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActiveRide;
