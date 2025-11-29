
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const RideHistory = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [rides, setRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/");
        return;
      }
      
      setIsLoggedIn(true);
      fetchRideHistory(data.session.user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchRideHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('rider_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRides(data || []);
    } catch (error) {
      console.error('Error fetching ride history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header isLoggedIn={isLoggedIn} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Ride History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You haven't taken any rides yet.
              </div>
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => (
                  <div key={ride.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{ride.pickup_location} → {ride.destination}</h3>
                        <p className="text-sm text-gray-500">{formatDate(ride.created_at)}</p>
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium
                          ${ride.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            ride.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}
                        `}>
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                        </span>
                        <p className="text-right mt-1 font-medium">₹{ride.estimated_price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2023 Hailo - College Ride-Sharing Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default RideHistory;
