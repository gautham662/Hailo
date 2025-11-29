
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Locate, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: {
    id: string;
    lngLat: [number, number];
    type: "pickup" | "dropoff" | "driver";
  }[];
  showUserLocation?: boolean;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  drawRoute?: {
    start: [number, number];
    end: [number, number];
  };
}

const MapView = ({
  center = [77.2090, 28.6139], // Default to Delhi
  zoom = 13,
  markers = [],
  showUserLocation = true,
  onMapClick,
  drawRoute,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json", // Free OpenStreetMap style
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Setup click handler if needed
    if (onMapClick) {
      map.current.on("click", (e) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle user geolocation
  useEffect(() => {
    if (!map.current || !showUserLocation) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);

          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              essential: true,
            });

            // Add a marker for user location
            const userMarker = new maplibregl.Marker({ color: "#4B56D2" })
              .setLngLat([longitude, latitude])
              .addTo(map.current);

            return () => {
              userMarker.remove();
            };
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enable location access.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  }, [showUserLocation]);

  // Handle markers
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add new markers
    markers.forEach((marker) => {
      const element = document.createElement("div");
      element.className = "marker";
      
      // Style based on marker type
      if (marker.type === "pickup") {
        element.innerHTML = `<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">P</div>`;
      } else if (marker.type === "dropoff") {
        element.innerHTML = `<div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">D</div>`;
      } else {
        element.innerHTML = `<div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11 2 11.3V15c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        </div>`;
      }

      const newMarker = new maplibregl.Marker({ element })
        .setLngLat(marker.lngLat)
        .addTo(map.current!);

      markersRef.current[marker.id] = newMarker;
    });
  }, [markers]);

  // Draw route between two points if provided
  useEffect(() => {
    if (!map.current || !drawRoute) return;

    const drawRouteOnMap = async () => {
      if (!map.current || !drawRoute?.start || !drawRoute?.end) return;

      // Remove existing route layer if it exists
      if (map.current.getSource("route")) {
        map.current.removeLayer("route");
        map.current.removeSource("route");
      }

      // Generate a simple straight line for now (would use actual routing API in production)
      const routeData = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [drawRoute.start, drawRoute.end],
        },
      };

      // Add the route to the map
      map.current.once("style.load", () => {
        if (!map.current) return;
        
        map.current.addSource("route", {
          type: "geojson",
          data: routeData as any,
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#4B56D2",
            "line-width": 6,
            "line-opacity": 0.7,
          },
        });
      });

      // If the map is already loaded, add the route immediately
      if (map.current.isStyleLoaded()) {
        map.current.addSource("route", {
          type: "geojson",
          data: routeData as any,
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#4B56D2",
            "line-width": 6,
            "line-opacity": 0.7,
          },
        });
      }
    };

    drawRouteOnMap();
  }, [drawRoute]);

  // Function to recenter map to user's location
  const centerToUserLocation = () => {
    if (!map.current || !userLocation) return;
    
    map.current.flyTo({
      center: userLocation,
      zoom: 15,
      essential: true,
    });
  };

  return (
    <Card className="relative w-full h-[400px] md:h-[500px] overflow-hidden shadow-md">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {showUserLocation && (
          <Button 
            variant="secondary" 
            size="icon"
            className="bg-white shadow-md hover:bg-gray-100"
            onClick={centerToUserLocation}
          >
            <Locate className="h-5 w-5 text-gray-700" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MapView;
