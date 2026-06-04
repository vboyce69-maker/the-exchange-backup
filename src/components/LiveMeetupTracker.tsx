
"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Car,
  User,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  Maximize2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TrackerProps {
  buyerName: string;
  sellerName: string;
  safeZoneName: string;
  onArrival: (role: "buyer" | "seller") => void;
}

export function LiveMeetupTracker({
  buyerName,
  sellerName,
  safeZoneName,
  onArrival,
}: TrackerProps) {
  const [buyerDist, setBuyerDist] = useState(4.2);
  const [sellerDist, setSellerDist] = useState(2.8);
  const [isBuyerArrived, setIsBuyerArrived] = useState(false);
  const [isSellerArrived, setIsSellerArrived] = useState(false);

  // Simulated live movement
  useEffect(() => {
    const interval = setInterval(() => {
      setBuyerDist((prev) => Math.max(0, +(prev - 0.1).toFixed(1)));
      setSellerDist((prev) => Math.max(0, +(prev - 0.15).toFixed(1)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (buyerDist <= 0 && !isBuyerArrived) {
      setIsBuyerArrived(true);
      onArrival("buyer");
    }
  }, [buyerDist]);

  useEffect(() => {
    if (sellerDist <= 0 && !isSellerArrived) {
      setIsSellerArrived(true);
      onArrival("seller");
    }
  }, [sellerDist]);

  return (
    <div className="animate-in slide-in-from-top-4 duration-500">
      <Card className="rounded-[2rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
        <div className="bg-[#225BC3] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#34CBED] animate-pulse" />
            </div>
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest opacity-70 leading-none">
                Meetup Point
              </p>
              <h4 className="text-xs font-black uppercase">{safeZoneName}</h4>
            </div>
          </div>
          <Badge className="bg-[#34CBED] text-white border-none text-[8px] font-black px-2 py-0.5">
            Live Tracking
          </Badge>
        </div>

        <div className="p-5 space-y-6">
          {/* Tracking visualization */}
          <div className="relative h-2 bg-slate-100 rounded-full flex items-center">
            <div className="absolute left-0 w-full flex justify-between px-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-slate-200 rounded-full" />
              ))}
            </div>

            {/* Buyer Marker */}
            <div
              className="absolute transition-all duration-1000 ease-linear flex flex-col items-center"
              style={{
                left: `${Math.max(0, 100 - (buyerDist / 5) * 100)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg mb-1 relative">
                <User className="w-3 h-3 text-white" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rotate-45" />
              </div>
              <span className="text-[6px] font-black uppercase text-blue-600 bg-white px-1 whitespace-nowrap">
                You
              </span>
            </div>

            {/* Seller Marker */}
            <div
              className="absolute transition-all duration-1000 ease-linear flex flex-col items-center"
              style={{
                left: `${Math.max(0, 100 - (sellerDist / 5) * 100)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="bg-[#FF8C00] p-1.5 rounded-lg shadow-lg mb-1 relative">
                <Car className="w-3 h-3 text-white" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FF8C00] rotate-45" />
              </div>
              <span className="text-[6px] font-black uppercase text-[#FF8C00] bg-white px-1 whitespace-nowrap">
                {sellerName}
              </span>
            </div>

            {/* Destination Marker */}
            <div className="absolute right-0 translate-x-1/2 flex flex-col items-center">
              <div className="bg-green-500 p-2 rounded-xl shadow-xl mb-1 ring-4 ring-green-100">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className={cn(
                "p-4 rounded-2xl border transition-all",
                isBuyerArrived
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-100",
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black uppercase text-slate-400">
                  Your Status
                </span>
                {isBuyerArrived && (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
              </div>
              <p className="text-sm font-black text-slate-900 leading-none">
                {isBuyerArrived ? "Arrived" : `${buyerDist}km away`}
              </p>
              <p className="text-[9px] font-bold text-slate-500 mt-1">
                ETA: {Math.ceil(buyerDist * 2)} mins
              </p>
            </div>

            <div
              className={cn(
                "p-4 rounded-2xl border transition-all",
                isSellerArrived
                  ? "bg-green-50 border-green-200"
                  : "bg-orange-50 border-orange-100",
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black uppercase text-slate-400">
                  Seller Status
                </span>
                {isSellerArrived && (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
              </div>
              <p className="text-sm font-black text-slate-900 leading-none">
                {isSellerArrived ? "Arrived" : `${sellerDist}km away`}
              </p>
              <p className="text-[9px] font-bold text-slate-500 mt-1">
                ETA: {Math.ceil(sellerDist * 1.5)} mins
              </p>
            </div>
          </div>

          {isBuyerArrived && isSellerArrived ? (
            <div className="p-4 bg-green-500 rounded-2xl text-center space-y-2 shadow-xl animate-bounce">
              <div className="flex items-center justify-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-tighter">
                  Both Parties Arrived
                </span>
              </div>
              <p className="text-[9px] text-white/90 font-bold">
                You are at the Safe Zone. Proceed with inspection.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 opacity-50">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                Monitoring safe arrival...
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
