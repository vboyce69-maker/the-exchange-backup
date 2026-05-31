"use client";

import { useState, useCallback, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, ChevronRight, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "2.5rem",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#225BC3" }, { weight: "700" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#EEF1F3" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#F8FAFC" }],
    },
  ],
};

interface ListingMapProps {
  listings: any[];
}

export function ListingMap({ listings }: ListingMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const center = useMemo(() => {
    // Default to Johannesburg area
    return { lat: -26.2041, lng: 28.0473 };
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedId),
    [listings, selectedId],
  );

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Loading Map Engine...
        </p>
      </div>
    );
  }

  // If no API key, show simulated map
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-[600px] bg-blue-50/50 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden ring-1 ring-blue-100">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <MapPin className="w-32 h-32 text-primary" />
        </div>
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-4">
          <Zap className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <div className="max-w-md space-y-3">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Geographic Discovery Interface
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            To activate the live listing map, please configure a Google Maps API
            Key in your environment settings.
          </p>
          <div className="p-4 bg-white rounded-2xl border border-blue-100 font-mono text-[10px] text-primary">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-2 bg-blue-100 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative shadow-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions as any}
      >
        {listings.map((listing) => {
          // Fallback coordinates if none exist (simulated for prototype)
          const lat =
            listing.latitude || -26.2041 + (Math.random() - 0.5) * 0.1;
          const lng =
            listing.longitude || 28.0473 + (Math.random() - 0.5) * 0.1;

          return (
            <Marker
              key={listing.id}
              position={{ lat, lng }}
              onClick={() => setSelectedId(listing.id)}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                fillColor: listing.isBoosted ? "#FF8C00" : "#225BC3",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#FFFFFF",
                scale: 1.5,
                labelOrigin: new google.maps.Point(12, 10),
              }}
            />
          );
        })}

        {selectedListing && (
          <InfoWindow
            position={{
              lat: selectedListing.latitude || center.lat,
              lng: selectedListing.longitude || center.lng,
            }}
            onCloseClick={() => setSelectedId(null)}
          >
            <Card className="w-56 rounded-2xl border-none shadow-none p-0 overflow-hidden">
              <div className="relative aspect-video w-full">
                <Image
                  src={
                    selectedListing.imageUrls?.[0] ||
                    "https://picsum.photos/seed/map/400/200"
                  }
                  alt={selectedListing.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-black text-[10px] uppercase text-slate-900 truncate leading-tight flex-1">
                    {selectedListing.title}
                  </h4>
                  {selectedListing.isBoosted && (
                    <Zap className="w-3.5 h-3.5 text-accent fill-current" />
                  )}
                </div>
                <p className="font-black text-sm text-primary leading-none">
                  R {selectedListing.price?.toLocaleString()}
                </p>
                <Link href={`/listings/${selectedListing.id}`}>
                  <Button
                    size="sm"
                    className="w-full h-8 rounded-xl bg-slate-900 text-white font-black text-[8px] uppercase tracking-widest mt-2"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:w-72 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl ring-1 ring-slate-100 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3 text-primary mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            Regional Discovery
          </span>
        </div>
        <p className="text-[10px] text-slate-600 font-bold leading-relaxed mb-4">
          Showing {listings.length} verified listings in your current view. Use
          the map to find deals in secure meetup zones.
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span className="text-[8px] font-black text-slate-400 uppercase">
            Standard Listing
          </span>
          <div className="w-2 h-2 bg-accent rounded-full ml-2" />
          <span className="text-[8px] font-black text-slate-400 uppercase">
            Featured
          </span>
        </div>
      </div>
    </div>
  );
}
