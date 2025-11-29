
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RiderDashboard from "@/components/rider/RiderDashboard";
import DriverDashboard from "@/components/driver/DriverDashboard";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import AuthSection from "@/components/auth/AuthSection";

const Index = () => {
  const [userMode, setUserMode] = useState<"rider" | "driver">("rider");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome!",
            description: "You are now signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out.",
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleModeChange = (value: string) => {
    setUserMode(value as "rider" | "driver");
    toast({
      title: `Switched to ${value} mode`,
      description: `You are now in ${value} mode`,
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header isLoggedIn={isLoggedIn} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {!isLoggedIn ? (
          <AuthSection />
        ) : (
          <>
            <Tabs
              defaultValue="rider"
              value={userMode}
              onValueChange={handleModeChange}
              className="w-full"
            >
              <div className="flex justify-center mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="rider">Rider Mode</TabsTrigger>
                  <TabsTrigger value="driver">Driver Mode</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="rider" className="mt-2">
                <RiderDashboard />
              </TabsContent>
              
              <TabsContent value="driver" className="mt-2">
                <DriverDashboard />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2023 Hailo - College Ride-Sharing Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
