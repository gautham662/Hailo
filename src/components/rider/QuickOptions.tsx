
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Search } from "lucide-react";

const QuickOptions = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-white shadow-sm hover:shadow transition-shadow cursor-pointer">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Schedule</h3>
            <p className="text-sm text-gray-500">Plan ahead</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm hover:shadow transition-shadow cursor-pointer">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <Search className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Campus Spots</h3>
            <p className="text-sm text-gray-500">Quick rides</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickOptions;
