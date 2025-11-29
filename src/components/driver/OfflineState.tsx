
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface OfflineStateProps {
  onGoOnline: () => void;
}

const OfflineState = ({ onGoOnline }: OfflineStateProps) => {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
        <User className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700">You're Offline</h3>
      <p className="text-gray-500 mt-1 mb-4">Go online to start receiving ride requests</p>
      <Button 
        onClick={onGoOnline}
        className="bg-purple-600 hover:bg-purple-700"
      >
        Go Online
      </Button>
    </div>
  );
};

export default OfflineState;
