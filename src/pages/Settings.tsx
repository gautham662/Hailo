
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";

const Settings = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/");
        return;
      }
      
      setIsLoggedIn(true);
    };

    checkAuth();
  }, [navigate]);

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated."
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header isLoggedIn={isLoggedIn} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Notifications</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="cursor-pointer">
                  Push notifications
                </Label>
                <Switch 
                  id="notifications" 
                  checked={notifications} 
                  onCheckedChange={setNotifications} 
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Appearance</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode" className="cursor-pointer">
                  Dark mode
                </Label>
                <Switch 
                  id="darkMode" 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode} 
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Privacy</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="locationSharing" className="cursor-pointer">
                  Share location during rides
                </Label>
                <Switch 
                  id="locationSharing" 
                  checked={locationSharing} 
                  onCheckedChange={setLocationSharing} 
                />
              </div>
            </div>
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
              onClick={handleSaveSettings}
            >
              Save Changes
            </Button>
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

export default Settings;
