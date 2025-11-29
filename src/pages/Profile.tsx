
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        navigate("/");
        toast({
          title: "Not logged in",
          description: "Please sign in to view your profile",
          variant: "destructive",
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.session.user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFullName(data.full_name || "");
          setCollege(data.college || "");
          setPhoneNumber(data.phone || "");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        navigate("/");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          college: college,
          phone: phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.session.user.id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header isLoggedIn={true} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center my-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input 
                    id="college" 
                    value={college} 
                    onChange={(e) => setCollege(e.target.value)} 
                    placeholder="Your college"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="Your phone number"
                  />
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                  >
                    Save Changes
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
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

export default Profile;
