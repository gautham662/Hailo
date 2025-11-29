
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Location {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface LocationSearchProps {
  label: string;
  placeholder: string;
  icon?: React.ReactNode;
  onLocationSelect: (location: Location) => void;
  defaultLocation?: Location | null;
}

const LocationSearch = ({
  label,
  placeholder,
  icon,
  onLocationSelect,
  defaultLocation,
}: LocationSearchProps) => {
  const [inputValue, setInputValue] = useState(defaultLocation?.name || "");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultLocation) {
      setInputValue(defaultLocation.name);
    }
  }, [defaultLocation]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5`
      );
      const data = await response.json();
      
      const formattedSuggestions = data.map((item: any) => ({
        name: item.display_name,
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)] as [number, number],
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error searching locations:", error);
      toast({
        title: "Search Error",
        description: "Failed to search locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length >= 3) {
      searchLocations(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location: Location) => {
    setInputValue(location.name);
    onLocationSelect(location);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            const location: Location = {
              name: data.display_name || "Current Location",
              coordinates: [longitude, latitude],
            };
            
            setInputValue(location.name);
            onLocationSelect(location);
          } catch (error) {
            console.error("Error getting location details:", error);
            
            // Fallback to just coordinates
            const location: Location = {
              name: "Current Location",
              coordinates: [longitude, latitude],
            };
            
            setInputValue(location.name);
            onLocationSelect(location);
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting current location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enable location access.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative space-y-2">
      <Label htmlFor={`location-${label}`}>{label}</Label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {icon || <MapPin className="h-5 w-5 text-gray-500" />}
        </div>
        
        <Input
          id={`location-${label}`}
          className="pl-10 pr-24"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 3 && setShowSuggestions(true)}
        />
        
        {label === "Pickup Location" && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={handleUseCurrentLocation}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Use Current"
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Location Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-start gap-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                <span className="line-clamp-2">{suggestion.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
