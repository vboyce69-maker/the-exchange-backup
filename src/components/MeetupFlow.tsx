"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, onSnapshot } from "firebase/firestore";
import { Geolocation } from "@capacitor/geolocation";
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  Car,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { SAFE_ZONES, SafeZone } from "@/lib/safe-zones";
import { useFunctions, useFirestore, useUser } from "@/firebase";

// ---- Types ----

interface LiveLocation {
  lat: number;
  lng: number;
  accuracy: number;
  updatedAt: { seconds: number };
}

interface MeetupData {
  status: "unset" | "proposed" | "confirmed" | "cancelled";
  proposedBy?: string;
  location?: { lat: number; lng: number; label: string };
  confirmedBy?: string[];
  liveLocations?: Record<string, LiveLocation>;
}

interface Transaction {
  buyerId: string;
  sellerId: string;
  meetup?: MeetupData;
}

interface MeetupFlowProps {
  transactionId: string;
  currentUserId: string;
  buyerName: string;
  sellerName: string;
}

// ---- Distance helper (Haversine) ----
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---- Sub-component: Safe Zone Picker ----
function SafeZonePicker({
  onSelect,
  onCancel,
  isLoading,
}: {
  onSelect: (zone: SafeZone) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [selected, setSelected] = useState<SafeZone | null>(null);

  const cities = Array.from(new Set(SAFE_ZONES.map((z) => z.city)));

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Step 1 of 2
          </p>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Choose Meeting Point
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="rounded-xl h-10 w-10"
        >
          <X className="w-5 h-5 text-slate-400" />
        </Button>
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-[#225BC3] shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
          Always meet at a SAPS Safe Zone. These are monitored locations
          designed to keep both parties protected during exchanges.
        </p>
      </div>

      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {cities.map((city) => (
          <div key={city}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
              {city}
            </p>
            <div className="space-y-2">
              {SAFE_ZONES.filter((z) => z.city === city).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelected(zone)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all",
                    selected?.id === zone.id
                      ? "bg-[#225BC3] border-[#225BC3] text-white shadow-xl"
                      : "bg-white border-slate-100 text-slate-700 hover:border-[#225BC3]/30 hover:bg-blue-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      className={cn(
                        "w-4 h-4 shrink-0",
                        selected?.id === zone.id
                          ? "text-[#34CBED]"
                          : "text-slate-400",
                      )}
                    />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight leading-none">
                        {zone.label}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-medium mt-0.5",
                          selected?.id === zone.id
                            ? "text-white/70"
                            : "text-slate-400",
                        )}
                      >
                        {zone.address}
                      </p>
                    </div>
                    {selected?.id === zone.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#34CBED] ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        className="w-full h-14 bg-[#225BC3] text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-xl disabled:opacity-50"
        disabled={!selected || isLoading}
        onClick={() => selected && onSelect(selected)}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            Propose This Location
          </>
        )}
      </Button>
    </div>
  );
}

// ---- Sub-component: Waiting for other party ----
function WaitingForConfirmation({
  meetup,
  currentUserId,
  buyerName,
  sellerName,
  onConfirm,
  onSuggestDifferent,
  isLoading,
}: {
  meetup: MeetupData;
  currentUserId: string;
  buyerName: string;
  sellerName: string;
  onConfirm: () => void;
  onSuggestDifferent: () => void;
  isLoading: boolean;
}) {
  const isProposer = meetup.proposedBy === currentUserId;
  const otherName = isProposer ? sellerName : buyerName;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-[#FF8C00] animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          {isProposer ? "Waiting for Confirmation" : "Meetup Proposed"}
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          {isProposer
            ? `Waiting for ${otherName} to confirm the meeting point.`
            : `${otherName} proposed a meeting point. Please confirm or suggest a different one.`}
        </p>
      </div>

      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Proposed Location
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#225BC3] rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <p className="font-black text-slate-900 text-sm uppercase tracking-tight">
            {meetup.location?.label}
          </p>
        </div>
      </div>

      {!isProposer && (
        <Button
          className="w-full h-14 bg-green-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-xl"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm This Location
            </>
          )}
        </Button>
      )}

      <Button
        variant="outline"
        className="w-full h-12 rounded-2xl font-black text-[11px] uppercase tracking-widest border-slate-200 text-slate-500"
        onClick={onSuggestDifferent}
        disabled={isLoading}
      >
        Suggest Different Location
      </Button>
    </div>
  );
}

// ---- Sub-component: Live Tracker (real GPS) ----
function LiveTracker({
  transactionId,
  meetup,
  currentUserId,
  buyerId,
  buyerName,
  sellerName,
  onUpdateLocation,
}: {
  transactionId: string;
  meetup: MeetupData;
  currentUserId: string;
  buyerId: string;
  buyerName: string;
  sellerName: string;
  onUpdateLocation: (lat: number, lng: number, accuracy: number) => void;
}) {
  const destination = meetup.location!;
  const liveLocations = meetup.liveLocations ?? {};

  const isBuyer = currentUserId === buyerId;
  const myLocation = liveLocations[currentUserId];
  const otherLocation = Object.entries(liveLocations).find(([k]) => k !== currentUserId)?.[1];

  const myDist = myLocation
    ? distanceKm(myLocation.lat, myLocation.lng, destination.lat, destination.lng)
    : null;
  const otherDist = otherLocation
    ? distanceKm(otherLocation.lat, otherLocation.lng, destination.lat, destination.lng)
    : null;

  const myArrived = myDist !== null && myDist < 0.05;
  const otherArrived = otherDist !== null && otherDist < 0.05;
  const bothArrived = myArrived && otherArrived;

  const myLabel = isBuyer ? "You (Buyer)" : "You (Seller)";
  const otherLabel = isBuyer ? sellerName : buyerName;

  // GPS polling every 15s
  useEffect(() => {
    const poll = async () => {
      try {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        onUpdateLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      } catch {
        // GPS unavailable — silently skip this tick
      }
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [transactionId]);

  return (
    <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
      <div className="bg-[#225BC3] rounded-2xl p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Navigation className="w-4 h-4 text-[#34CBED] animate-pulse" />
          </div>
          <div>
            <p className="text-[7px] font-black uppercase tracking-widest opacity-70">
              Meetup Point
            </p>
            <h4 className="text-xs font-black uppercase">{destination.label}</h4>
          </div>
        </div>
        <Badge className="bg-[#34CBED] text-white border-none text-[8px] font-black px-2 py-0.5">
          Live Tracking
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={cn("p-4 rounded-2xl border transition-all", myArrived ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-100")}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-black uppercase text-slate-400">{myLabel}</span>
            {myArrived && <CheckCircle2 className="w-3 h-3 text-green-500" />}
          </div>
          {myLocation ? (
            <>
              <p className="text-sm font-black text-slate-900 leading-none">
                {myArrived ? "Arrived ✓" : `${myDist!.toFixed(1)}km away`}
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-1">GPS ±{Math.round(myLocation.accuracy)}m</p>
            </>
          ) : (
            <p className="text-[10px] font-bold text-slate-400">Getting GPS...</p>
          )}
        </div>

        <div className={cn("p-4 rounded-2xl border transition-all", otherArrived ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-100")}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-black uppercase text-slate-400">{otherLabel}</span>
            {otherArrived && <CheckCircle2 className="w-3 h-3 text-green-500" />}
          </div>
          {otherLocation ? (
            <>
              <p className="text-sm font-black text-slate-900 leading-none">
                {otherArrived ? "Arrived ✓" : `${otherDist!.toFixed(1)}km away`}
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-1">GPS ±{Math.round(otherLocation.accuracy)}m</p>
            </>
          ) : (
            <p className="text-[10px] font-bold text-slate-400">Waiting for their GPS...</p>
          )}
        </div>
      </div>

      {bothArrived ? (
        <div className="p-5 bg-green-500 rounded-2xl text-center space-y-2 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-tighter">Both Parties at Safe Zone</span>
          </div>
          <p className="text-[10px] text-white/90 font-bold">
            You are both at {destination.label}. Proceed with inspection and confirm receipt when done.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 opacity-50 py-2">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
            Monitoring safe arrival...
          </span>
        </div>
      )}
    </div>
  );
}

// ---- Main MeetupFlow component ----

export function MeetupFlow({
  transactionId,
  currentUserId,
  buyerName,
  sellerName,
}: MeetupFlowProps) {
  const functionsInstance = useFunctions();
  const db = useFirestore();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!db || !transactionId) return;
    const ref = doc(db, "transactions", transactionId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setTransaction(snap.data() as Transaction);
    });
    return unsub;
  }, [db, transactionId]);

  const meetup = transaction?.meetup;
  const status = meetup?.status ?? "unset";

  const handlePropose = async (zone: SafeZone) => {
    if (!functionsInstance) return;
    setIsLoading(true);
    try {
      const fn = httpsCallable(functionsInstance, "proposeMeetup");
      await fn({ transactionId, location: { lat: zone.lat, lng: zone.lng, label: zone.label } });
      setShowPicker(false);
      toast({ title: "Meeting Point Proposed", description: `You proposed ${zone.label}. Waiting for the other party to confirm.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e?.message ?? "Could not propose meetup." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!functionsInstance) return;
    setIsLoading(true);
    try {
      const fn = httpsCallable(functionsInstance, "confirmMeetup");
      await fn({ transactionId });
      toast({ title: "Meetup Confirmed!", description: "Both parties agreed. Head to the safe zone." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e?.message ?? "Could not confirm meetup." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestDifferent = async () => {
    if (!functionsInstance) return;
    setIsLoading(true);
    try {
      const fn = httpsCallable(functionsInstance, "cancelMeetup");
      await fn({ transactionId });
      setShowPicker(true);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e?.message ?? "Could not reset meetup." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLocation = useCallback(
    async (lat: number, lng: number, accuracy: number) => {
      if (!functionsInstance) return;
      try {
        const fn = httpsCallable(functionsInstance, "updateLiveLocation");
        await fn({ transactionId, lat, lng, accuracy });
      } catch {
        // silently ignore — next poll will retry
      }
    },
    [functionsInstance, transactionId],
  );

  if (!transaction) return null;

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden ring-1 ring-slate-100">
      <CardContent className="p-8">
        {(status === "unset" || showPicker) && (
          <SafeZonePicker
            onSelect={handlePropose}
            onCancel={() => setShowPicker(false)}
            isLoading={isLoading}
          />
        )}

        {status === "proposed" && !showPicker && meetup && (
          <WaitingForConfirmation
            meetup={meetup}
            currentUserId={currentUserId}
            buyerName={buyerName}
            sellerName={sellerName}
            onConfirm={handleConfirm}
            onSuggestDifferent={handleSuggestDifferent}
            isLoading={isLoading}
          />
        )}

        {status === "confirmed" && meetup && transaction && (
          <LiveTracker
            transactionId={transactionId}
            meetup={meetup}
            currentUserId={currentUserId}
            buyerId={transaction.buyerId}
            buyerName={buyerName}
            sellerName={sellerName}
            onUpdateLocation={handleUpdateLocation}
          />
        )}
      </CardContent>
    </Card>
  );
}
