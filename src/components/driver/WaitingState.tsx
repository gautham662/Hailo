
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface WaitingStateProps {
  onRefresh: () => void;
}

const WaitingState = ({ onRefresh }: WaitingStateProps) => {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
        <Clock className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700">Waiting for Requests</h3>
      <p className="text-gray-500 mt-1">You'll be notified when new rides are available</p>
      <Button 
        onClick={onRefresh} 
        variant="outline"
        className="mt-4"
      >
        Refresh Requests
      </Button>
    </div>
  );
};

export default WaitingState;
