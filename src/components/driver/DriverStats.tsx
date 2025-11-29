
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const DriverStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="text-sm text-gray-500">Today's Earnings</h4>
          <p className="text-xl font-semibold">₹240</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="text-sm text-gray-500">Total Rides</h4>
          <p className="text-xl font-semibold">5</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="text-sm text-gray-500">Hours Online</h4>
          <p className="text-xl font-semibold">3.5</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="text-sm text-gray-500">Rating</h4>
          <div className="flex items-center gap-1">
            <p className="text-xl font-semibold">4.8</p>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverStats;
