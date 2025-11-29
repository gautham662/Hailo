
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MapView from "@/components/map/MapView";
import { useDriverState } from "./hooks/useDriverState";
import { getMapMarkers, getRouteToDisplay } from "./utils/driverUtils";
import { 
  toggleDriverStatus, 
  acceptRide, 
  declineRide, 
  confirmPickup, 
  completeRide 
} from "./actions/driverActions";
import OfflineState from "./OfflineState";
import WaitingState from "./WaitingState";
import RideRequestCard from "./RideRequestCard";
import ActiveRide from "./ActiveRide";
import DriverStats from "./DriverStats";

const DriverDashboard = () => {
  const {
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
  } = useDriverState();

  const handleToggleDriverStatus = async () => {
    await toggleDriverStatus(
      isOnline, 
      setIsOnline, 
      setDriverStatus, 
      fetchAvailableRides, 
      toast
    );
  };

  const handleAcceptRide = async (ride: any) => {
    await acceptRide(
      ride,
      setCurrentRide,
      setCurrentRideId,
      setRideRequests,
      setDriverStatus,
      toast
    );
  };

  const handleDeclineRide = (rideId: string) => {
    declineRide(rideId, rideRequests, setRideRequests, toast);
  };

  const handleConfirmPickup = async () => {
    await confirmPickup(currentRideId, setDriverStatus, toast);
  };

  const handleCompleteRide = async () => {
    await completeRide(currentRideId, setDriverStatus, toast);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800">Driver Dashboard</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="driver-status"
                checked={isOnline}
                onCheckedChange={handleToggleDriverStatus}
              />
              <Label htmlFor="driver-status" className="text-sm">
                {isOnline ? (
                  <span className="text-green-600 font-semibold">Online</span>
                ) : (
                  <span className="text-gray-400">Offline</span>
                )}
              </Label>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {driverStatus === "offline" && (
            <OfflineState onGoOnline={handleToggleDriverStatus} />
          )}
          
          {driverStatus === "online" && (
            <>
              {rideRequests.length === 0 ? (
                <WaitingState onRefresh={fetchAvailableRides} />
              ) : (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">New Ride Requests</h3>
                  
                  {rideRequests.map((request) => (
                    <RideRequestCard
                      key={request.id}
                      request={request}
                      onAccept={handleAcceptRide}
                      onDecline={handleDeclineRide}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          
          {(driverStatus === "rideAccepted" || driverStatus === "pickingUp" || 
            driverStatus === "inProgress" || driverStatus === "completed") && currentRide && (
            <ActiveRide
              currentRide={currentRide}
              driverStatus={driverStatus}
              onConfirmPickup={handleConfirmPickup}
              onCompleteRide={handleCompleteRide}
              onFindNewRides={resetRideState}
            />
          )}
        </CardContent>
      </Card>
      
      <MapView 
        markers={getMapMarkers(driverStatus, currentRide)}
        drawRoute={getRouteToDisplay(driverStatus, currentRide)}
        zoom={14}
      />
      
      {driverStatus !== "offline" && <DriverStats />}
    </div>
  );
};

export default DriverDashboard;
