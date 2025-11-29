
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Car } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Header = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string | null>(null);

  // Get user data including the name
  useEffect(() => {
    const getUserProfile = async () => {
      if (!isLoggedIn) return;
      
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        // Try to get the full name from user metadata
        const fullName = data.user.user_metadata?.full_name;
        
        if (fullName) {
          setUserName(fullName);
        } else {
          // Fallback to getting it from the profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .single();
            
          if (profileData) {
            setUserName(profileData.full_name);
          }
        }
      }
    };
    
    getUserProfile();
  }, [isLoggedIn]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 bg-purple-600 rounded-full flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Hailo</h1>
            <div className="hidden md:flex bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              College Edition
            </div>
          </Link>
          
          <nav className="flex gap-4 items-center">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/history" 
                  className="text-gray-600 hover:text-gray-900 hidden md:block"
                >
                  Ride History
                </Link>
                <Link 
                  to="/settings" 
                  className="text-gray-600 hover:text-gray-900 hidden md:block"
                >
                  Settings
                </Link>
                <Link 
                  to="/help" 
                  className="text-gray-600 hover:text-gray-900 hidden md:block"
                >
                  Help
                </Link>
                
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="flex items-center gap-1 text-gray-800 hover:text-purple-600">
                    <span className="font-medium">{userName || 'My Profile'}</span>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={() => navigate("/")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
