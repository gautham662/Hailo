
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import RideHistory from "./pages/RideHistory";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Initialize Supabase auth and realtime functionality
    const initializeAuth = async () => {
      try {
        await supabase.auth.getSession();
        
        // Enable realtime for ride_requests table using proper type casting
        try {
          await supabase.rpc('enable_realtime_for_table', { table: 'ride_requests' } as any);
          console.log("Realtime enabled for ride_requests table");
        } catch (error) {
          console.error("Error enabling realtime:", error);
          // Continue app initialization even if this fails
        }
        
        setIsAppReady(true);
      } catch (error) {
        console.error("Error initializing auth:", error);
        toast({
          title: "Authentication Error",
          description: "Unable to connect to authentication service. Please try again later.",
          variant: "destructive",
        });
        setIsAppReady(true); // Allow the app to load anyway
      }
    };

    initializeAuth();
  }, []);

  if (!isAppReady) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<RideHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
