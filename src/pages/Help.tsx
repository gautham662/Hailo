
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";

const Help = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkAuth();
  }, []);

  const handleSubmitQuery = () => {
    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter your question or issue",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Query submitted",
      description: "We'll get back to you soon!"
    });
    setQuery("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header isLoggedIn={isLoggedIn} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Help & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Frequently Asked Questions</h3>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I request a ride?</AccordionTrigger>
                  <AccordionContent>
                    To request a ride, log in to your account, go to the Rider dashboard, enter your pickup location and destination, then click on "Request Ride".
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do payments work?</AccordionTrigger>
                  <AccordionContent>
                    Currently, Hailo only supports cash payments. You'll pay your driver directly after completing your ride.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I cancel a ride?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can cancel a ride anytime before a driver accepts your request without any penalty. Once a driver has accepted, cancellations may affect your rider rating.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I become a driver?</AccordionTrigger>
                  <AccordionContent>
                    To become a driver, simply toggle to "Driver Mode" in the app. Note that you'll need to verify your college ID and vehicle information before you can start accepting rides.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>Is my information secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Hailo takes security seriously. We only share necessary information between riders and drivers for the purpose of completing rides. Your personal data is encrypted and stored securely.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-gray-700">Still Need Help?</h3>
              <p className="text-gray-600">If you couldn't find the answer to your question, please submit your query below:</p>
              
              <div className="space-y-2">
                <Input
                  placeholder="Type your question or issue here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full"
                />
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleSubmitQuery}
                >
                  Submit
                </Button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">For urgent issues, contact support at:</p>
                <p className="font-medium text-purple-700">support@hailo-college.com</p>
              </div>
            </div>
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

export default Help;
