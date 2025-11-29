
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MapPin, Navigation, Star, X } from "lucide-react";
import { RideRequest } from "./utils/driverUtils";

interface RideRequestCardProps {
  request: RideRequest;
  onAccept: (ride: RideRequest) => void;
  onDecline: (rideId: string) => void;
}

const RideRequestCard = ({ request, onAccept, onDecline }: RideRequestCardProps) => {
  return (
    <Card key={request.id} className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-800 font-semibold">{request.rider.name.charAt(0)}</span>
            </div>
            <div>
              <h4 className="font-medium">{request.rider.name}</h4>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{request.rider.rating}</span>
              </div>
            </div>
          </div>
          
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {request.distance}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Pickup</p>
              <p className="text-sm line-clamp-1">{request.pickup.name}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Navigation className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Dropoff</p>
              <p className="text-sm line-clamp-1">{request.dropoff.name}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Fare</p>
            <p className="font-semibold">{request.fare}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => onDecline(request.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
            
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onAccept(request)}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RideRequestCard;
