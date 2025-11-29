
import { useState } from "react";
import MapView from "@/components/map/MapView";
import RideForm from "./RideForm";
import QuickOptions from "./QuickOptions";
import { useRideState } from "./hooks/useRideState";
import { getMapMarkers, getRouteToDisplay } from "./utils/mapUtils";
import { requestRide, cancelRide, confirmPickup, confirmDropoff } from "./RiderDashboardActions";
import { Location } from "./utils/locationUtils";

const RiderDashboard = () => {
  const {
    rideStatus,
    setRideStatus,
    pickup,
    setPickup,
    dropoff,
    setDropoff,
    currentRideId,
    setCurrentRideId,
    driverInfo,
    estimatedFare,
    setEstimatedFare
  } = useRideState();

  const handleLocationSelect = (type: "pickup" | "dropoff", location: Location) => {
    if (type === "pickup") {
      setPickup(location);
    } else {
      setDropoff(location);
    }
  };

  const handleRequestRide = async () => {
    await requestRide(pickup, dropoff, setRideStatus, setEstimatedFare, setCurrentRideId);
  };

  const handleCancelRide = async () => {
    await cancelRide(currentRideId, setCurrentRideId, setRideStatus);
  };

  const handleConfirmPickup = async () => {
    await confirmPickup(currentRideId, setRideStatus);
  };

  const handleConfirmDropoff = async () => {
    await confirmDropoff(currentRideId, setRideStatus);
  };

  const handleCompleteRide = () => {
    setCurrentRideId(null);
    setRideStatus("idle");
  };

  return (
    <div className="space-y-6">
      <RideForm
        rideStatus={rideStatus}
        pickup={pickup}
        dropoff={dropoff}
        driverInfo={driverInfo}
        estimatedFare={estimatedFare}
        onLocationSelect={handleLocationSelect}
        onRequestRide={handleRequestRide}
        onCancelRide={handleCancelRide}
        onConfirmPickup={handleConfirmPickup}
        onConfirmDropoff={handleConfirmDropoff}
        onCompleteRide={handleCompleteRide}
      />
      
      <MapView 
        markers={getMapMarkers(pickup, dropoff, rideStatus)}
        drawRoute={getRouteToDisplay(pickup, dropoff, rideStatus)}
        zoom={14}
      />

      {rideStatus === "idle" && <QuickOptions />}
    </div>
  );
};

export default RiderDashboard;
