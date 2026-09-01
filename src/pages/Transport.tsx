import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Car, Users, Package, Truck, MapPin, Calendar as CalIcon,
  ChevronDown, ChevronRight, Clock, Minus, Plus, MessageSquare, Search, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileNav from "@/components/MobileNav";
import FreightFlow from "@/components/transport/FreightFlow";
import BecomeDriverDialog from "@/components/transport/BecomeDriverDialog";
import { getUserId, getMode, setMode } from "@/lib/rideUser";
import { UserCog, IdCard } from "lucide-react";

type Screen =
  | "home" | "services" | "freight" | "route" | "rideType" | "when"
  | "passengersFare" | "comments" | "summary";
type RideType = "private" | "shared" | "parcel";
type LatLng = { lat: number; lng: number };
type Place = { address: string; location: LatLng };

const services = [
  { key: "car", label: "Request a car", icon: Car },
  { key: "share", label: "Share your ride", icon: Users },
  { key: "parcel", label: "Send a Parcel", icon: Package },
  { key: "freight", label: "Freight", icon: Truck },
  { key: "pickdrop", label: "Pick & Drop", icon: MapPin },
  { key: "schedule", label: "Schedule Ride", icon: CalIcon },
];

const PER_KM_PRIVATE = 60;
const PER_SEAT_SHARED = 500;
const MIN_FARE = 200;

// ---------- Google Maps loader (singleton) ----------
let mapsPromise: Promise<any> | null = null;
async function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") throw new Error("no window");
  if ((window as any).google?.maps?.places) return (window as any).google;
  if (mapsPromise) return mapsPromise;
  mapsPromise = (async () => {
    const { data, error } = await supabase.functions.invoke("get-maps-key");
    if (error || !data?.key) throw new Error("Failed to load maps key");
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}&libraries=places&loading=async`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Maps script failed"));
      document.head.appendChild(s);
    });
    // wait until google.maps.places is fully available
    for (let i = 0; i < 50 && !(window as any).google?.maps?.places; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return (window as any).google;
  })();
  return mapsPromise;
}

// ---------- Places autocomplete input ----------
function PlacesInput({
  value, onChange, onPick, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (p: Place) => void;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const sessionRef = useRef<any>(null);
  const svcRef = useRef<any>(null);
  const placesSvcRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadGoogleMaps().then((g) => {
      svcRef.current = new g.maps.places.AutocompleteService();
      sessionRef.current = new g.maps.places.AutocompleteSessionToken();
      const div = document.createElement("div");
      placesSvcRef.current = new g.maps.places.PlacesService(div);
    }).catch(() => {});
  }, []);

  const fetchSuggestions = (v: string) => {
    if (!svcRef.current || !v.trim()) { setSuggestions([]); return; }
    svcRef.current.getPlacePredictions(
      { input: v, sessionToken: sessionRef.current },
      (preds: any[]) => setSuggestions(preds || [])
    );
  };

  const handleChange = (v: string) => {
    onChange(v);
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(v), 200);
  };

  const pick = (sug: any) => {
    if (!placesSvcRef.current) return;
    placesSvcRef.current.getDetails(
      { placeId: sug.place_id, fields: ["formatted_address", "geometry", "name"] },
      (res: any) => {
        if (!res?.geometry?.location) return;
        const loc = { lat: res.geometry.location.lat(), lng: res.geometry.location.lng() };
        const addr = res.formatted_address || sug.description;
        onChange(addr);
        onPick({ address: addr, location: loc });
        setOpen(false);
        setSuggestions([]);
      }
    );
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-auto">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              className="w-full text-left px-3 py-2 hover:bg-muted flex items-start gap-2 border-b border-border last:border-0"
            >
              <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.structured_formatting?.main_text}</div>
                <div className="text-xs text-muted-foreground truncate">{s.structured_formatting?.secondary_text}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Fullscreen map picker ----------
function MapPicker({
  initial, onConfirm, onClose,
}: {
  initial?: LatLng;
  onConfirm: (p: Place) => void;
  onClose: () => void;
}) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [address, setAddress] = useState("Move the map to pick location");
  const [center, setCenter] = useState<LatLng>(initial || { lat: 24.8607, lng: 67.0011 });

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((g) => {
      if (cancelled || !mapDivRef.current) return;
      const start = initial || center;
      // try device geolocation if no initial
      const init = (c: LatLng) => {
        mapRef.current = new g.maps.Map(mapDivRef.current!, {
          center: c, zoom: 15, disableDefaultUI: true, zoomControl: true, gestureHandling: "greedy",
        });
        geocoderRef.current = new g.maps.Geocoder();
        setCenter(c);
        reverseGeocode(c);
        mapRef.current.addListener("idle", () => {
          const cc = mapRef.current.getCenter();
          const nc = { lat: cc.lat(), lng: cc.lng() };
          setCenter(nc);
          reverseGeocode(nc);
        });
      };
      if (!initial && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => init({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => init(start),
          { timeout: 5000 }
        );
      } else init(start);
    }).catch(() => toast({ title: "Map failed to load" }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reverseGeocode = useCallback((c: LatLng) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: c }, (res: any[]) => {
      if (res?.[0]) setAddress(res[0].formatted_address);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center gap-3 h-14 px-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        <div className="font-semibold">Choose on map</div>
      </div>
      <div className="relative flex-1">
        <div ref={mapDivRef} className="absolute inset-0" />
        {/* pin overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center -mt-8">
          <div className="max-w-[80%] px-3 py-1.5 rounded-full bg-card border border-border text-xs shadow-lg mb-1 truncate">
            {address}
          </div>
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-card">
        <Button className="w-full h-12" onClick={() => onConfirm({ address, location: center })}>
          Confirm location
        </Button>
      </div>
    </div>
  );
}

// ---------- Route preview mini-map with polyline + distance ----------
function RoutePreview({
  from, to, onDistance,
}: { from: Place; to: Place; onDistance: (km: number) => void }) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const [distanceText, setDistanceText] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((g) => {
      if (cancelled || !mapDivRef.current) return;
      const map = new g.maps.Map(mapDivRef.current, {
        center: from.location, zoom: 10, disableDefaultUI: true, gestureHandling: "greedy",
      });
      const ds = new g.maps.DirectionsService();
      const dr = new g.maps.DirectionsRenderer({
        map, suppressMarkers: false,
        polylineOptions: { strokeColor: "#2196F3", strokeWeight: 5 },
      });
      ds.route(
        { origin: from.location, destination: to.location, travelMode: g.maps.TravelMode.DRIVING },
        (res: any, status: any) => {
          if (status === "OK" && res) {
            dr.setDirections(res);
            const leg = res.routes[0].legs[0];
            setDistanceText(leg.distance.text);
            onDistance(leg.distance.value / 1000);
          } else {
            // fallback straight line
            new g.maps.Polyline({
              path: [from.location, to.location], map,
              strokeColor: "#2196F3", strokeWeight: 4,
            });
            const R = 6371;
            const toRad = (d: number) => (d * Math.PI) / 180;
            const dLat = toRad(to.location.lat - from.location.lat);
            const dLng = toRad(to.location.lng - from.location.lng);
            const a = Math.sin(dLat/2)**2 + Math.cos(toRad(from.location.lat))*Math.cos(toRad(to.location.lat))*Math.sin(dLng/2)**2;
            const km = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            setDistanceText(`${km.toFixed(1)} km`);
            onDistance(km);
          }
        }
      );
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from.address, to.address]);

  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <div ref={mapDivRef} className="h-48 w-full bg-muted" />
      {distanceText && (
        <div className="px-3 py-2 text-sm bg-card border-t border-border">
          Total distance: <span className="font-semibold text-primary">{distanceText}</span>
        </div>
      )}
    </div>
  );
}

// ---------- Scrollable date wheel ----------
function DateWheel({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const days: Date[] = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const fmt = (d: Date) =>
    `${d.toLocaleDateString(undefined, { weekday: "short" })} ${d.getDate()} ${d.toLocaleDateString(undefined, { month: "short" })}`;
  const selectedIdx = days.findIndex((d) => d.toDateString() === value.toDateString());
  const ITEM_H = 44;

  useEffect(() => {
    if (containerRef.current && selectedIdx >= 0) {
      containerRef.current.scrollTop = selectedIdx * ITEM_H;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    if (!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollTop / ITEM_H);
    if (idx >= 0 && idx < days.length && days[idx].toDateString() !== value.toDateString()) {
      onChange(days[idx]);
    }
  };

  return (
    <div className="relative h-[132px] rounded-xl border border-border bg-card overflow-hidden">
      <div className="absolute inset-x-0 top-[44px] h-[44px] border-y border-primary/40 bg-primary/5 pointer-events-none" />
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ paddingTop: 44, paddingBottom: 44 }}
      >
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              "h-[44px] flex items-center justify-center text-sm snap-center transition",
              i === selectedIdx ? "font-semibold text-primary" : "text-muted-foreground"
            )}
          >
            {fmt(d)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Main ----------
export default function Transport() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("home");
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [fromPlace, setFromPlace] = useState<Place | null>(null);
  const [toPlace, setToPlace] = useState<Place | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [mapPickerFor, setMapPickerFor] = useState<null | "from" | "to" | "any">(null);

  const [rideType, setRideType] = useState<RideType | null>(null);
  const [parcelFare, setParcelFare] = useState<number>(0);

  const [whenMode, setWhenMode] = useState<"now" | "later">("now");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [time, setTime] = useState("09:00");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");

  const [passengers, setPassengers] = useState(1);
  const [fare, setFare] = useState(0);
  const [fareLocked, setFareLocked] = useState(false);

  const [comments, setComments] = useState("");
  const [commentsSaved, setCommentsSaved] = useState("");

  // Driver mode gating
  const [isDriver, setIsDriver] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  useEffect(() => {
    const uid = getUserId();
    supabase.from("drivers").select("id").eq("user_id", uid).maybeSingle()
      .then(({ data }) => setIsDriver(!!data));
  }, []);
  const onDriverBtn = () => {
    if (isDriver) { setMode("driver"); navigate("/driver"); }
    else setDriverDialogOpen(true);
  };

  const privateFare = Math.max(MIN_FARE, Math.round(distanceKm * PER_KM_PRIVATE));
  const sharedFare = PER_SEAT_SHARED;

  const timeLabel = () => `${time} ${ampm}`;
  const dateLabel = () =>
    `${selectedDate.toLocaleDateString(undefined, { weekday: "short" })} ${selectedDate.getDate()} ${selectedDate.toLocaleDateString(undefined, { month: "short" })}`;

  const resetAll = () => {
    setScreen("home"); setFromText(""); setToText(""); setFromPlace(null); setToPlace(null);
    setDistanceKm(0); setRideType(null); setParcelFare(0);
    setWhenMode("now"); setSelectedDate(new Date()); setTime("09:00"); setAmpm("AM");
    setPassengers(1); setFare(0); setFareLocked(false);
    setComments(""); setCommentsSaved("");
  };

  const back = () => {
    const order: Screen[] = ["home", "services", "route", "rideType", "when", "passengersFare", "summary"];
    if (screen === "comments") return setScreen("summary");
    const i = order.indexOf(screen);
    if (i <= 0) navigate(-1); else setScreen(order[i - 1]);
  };

  const Header = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 h-14 px-3 border-b border-border sticky top-0 bg-card z-10">
      <Button variant="ghost" size="icon" onClick={back}><ArrowLeft className="w-5 h-5" /></Button>
      <h1 className="text-base font-semibold">{title}</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 md:pt-14 pt-14 pb-20 md:pb-6">
          <div className="max-w-2xl mx-auto relative">
            {/* Driver toggle button — top right */}
            <div className="absolute top-2 right-3 z-20">
              <Button size="sm" variant={isDriver ? "default" : "outline"} onClick={onDriverBtn}>
                {isDriver ? <><UserCog className="w-4 h-4 mr-1" /> Driver Mode</> : <><IdCard className="w-4 h-4 mr-1" /> Become a Driver</>}
              </Button>
            </div>
            {screen === "home" && (
              <>
                <Header title="Rides" />
                <div className="p-4">
                  <button
                    onClick={() => setScreen("services")}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-muted transition"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground">
                      <Car className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Only City to City</div>
                      <div className="text-xs text-muted-foreground">Book rides, parcels & freight between cities</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </>
            )}

            {screen === "services" && (
              <>
                <Header title="City to City" />
                <div className="p-4 grid grid-cols-2 gap-3">
                  {services.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setScreen(s.key === "freight" ? "freight" : "route")}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border bg-card hover:bg-muted transition"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <s.icon className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-medium text-center">{s.label}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {screen === "freight" && (
              <FreightFlow onExit={() => setScreen("services")} />
            )}


            {screen === "route" && (
              <>
                <Header title="Enter your route" />
                <div className="p-4 space-y-4">
                  <PlacesInput
                    placeholder="From"
                    value={fromText}
                    onChange={setFromText}
                    onPick={(p) => { setFromPlace(p); setFromText(p.address); }}
                  />
                  <PlacesInput
                    placeholder="To"
                    value={toText}
                    onChange={setToText}
                    onPick={(p) => { setToPlace(p); setToText(p.address); }}
                  />

                  <button
                    onClick={() => setMapPickerFor(!fromPlace ? "from" : !toPlace ? "to" : "any")}
                    className="w-full rounded-2xl border border-border bg-card overflow-hidden"
                  >
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 relative flex items-center justify-center">
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--primary)/0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                      <div className="relative flex flex-col items-center">
                        <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
                        <MapPin className="w-6 h-6 text-primary -mt-1" />
                      </div>
                    </div>
                    <div className="p-3 text-sm font-medium text-primary">Choose on map</div>
                  </button>

                  {fromPlace && toPlace && (
                    <RoutePreview from={fromPlace} to={toPlace} onDistance={setDistanceKm} />
                  )}

                  <Button
                    className="w-full h-12"
                    disabled={!fromPlace || !toPlace}
                    onClick={() => setScreen("rideType")}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}

            {screen === "rideType" && (
              <>
                <Header title="What ride do you need?" />
                <div className="p-4 space-y-3">
                  {distanceKm > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Estimated distance: <span className="font-semibold text-primary">{distanceKm.toFixed(1)} km</span>
                    </div>
                  )}
                  {[
                    { key: "private" as RideType, label: "Private ride", fare: `Rs ${privateFare.toLocaleString()}`, sub: distanceKm > 0 ? `Rs ${PER_KM_PRIVATE}/km · ${distanceKm.toFixed(1)} km` : "" },
                    { key: "shared" as RideType, label: "Shared ride", fare: `Rs ${sharedFare}`, sub: "per 1 seat" },
                    { key: "parcel" as RideType, label: "Parcel delivery", fare: "", sub: "Door to Door, Between City to City" },
                  ].map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setRideType(o.key)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border transition text-left",
                        rideType === o.key ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{o.label}</div>
                        {o.sub && <div className="text-xs text-muted-foreground mt-0.5">{o.sub}</div>}
                      </div>
                      {o.fare && <div className="font-bold text-primary whitespace-nowrap ml-3">{o.fare}</div>}
                    </button>
                  ))}

                  {rideType === "parcel" && (
                    <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
                      <div className="text-sm font-medium">Enter your fare (Rs)</div>
                      <Input
                        type="number"
                        placeholder="e.g. 1500"
                        value={parcelFare || ""}
                        onChange={(e) => setParcelFare(Number(e.target.value) || 0)}
                        className="h-12 text-lg font-bold"
                      />
                    </div>
                  )}

                  <Button
                    className="w-full h-12"
                    disabled={!rideType || (rideType === "parcel" && parcelFare <= 0)}
                    onClick={() => {
                      if (rideType === "private") setFare(privateFare);
                      else if (rideType === "shared") setFare(sharedFare);
                      else if (rideType === "parcel") setFare(parcelFare);
                      setScreen("when");
                    }}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}

            {screen === "when" && (
              <>
                <Header title="My Order" />
                <div className="p-4 space-y-4">
                  <div className="text-sm font-medium">When to start the ride</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "now" as const, label: "Now", Icon: Clock },
                      { k: "later" as const, label: "Later", Icon: CalIcon },
                    ].map((o) => (
                      <button
                        key={o.k}
                        onClick={() => setWhenMode(o.k)}
                        className={cn(
                          "flex items-center gap-2 p-4 rounded-2xl border justify-center",
                          whenMode === o.k ? "border-primary bg-primary/5 text-primary" : "border-border bg-card"
                        )}
                      >
                        <o.Icon className="w-5 h-5" />
                        <span className="font-medium">{o.label}</span>
                      </button>
                    ))}
                  </div>

                  {whenMode === "later" && (
                    <>
                      <div className="text-xs text-muted-foreground">Scroll to pick a date</div>
                      <DateWheel value={selectedDate} onChange={setSelectedDate} />
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                        <div className="flex-1 text-sm font-medium">{dateLabel()}</div>
                        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-28 h-9" />
                        <div className="flex rounded-md overflow-hidden border border-border">
                          {(["AM", "PM"] as const).map((p) => (
                            <button key={p} onClick={() => setAmpm(p)}
                              className={cn("px-2 py-1 text-xs", ampm === p ? "bg-primary text-primary-foreground" : "bg-card")}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    className="w-full h-12"
                    onClick={() => rideType === "private" ? setScreen("passengersFare") : setScreen("summary")}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}

            {screen === "passengersFare" && (
              <>
                <Header title="Private ride" />
                <div className="p-4 space-y-5">
                  <p className="text-xs text-muted-foreground">Specify number of passengers and your fare</p>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => setPassengers(n)}
                        className={cn(
                          "flex-1 h-10 rounded-lg border font-semibold",
                          passengers === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => setFare((f) => Math.max(MIN_FARE, f - 100))}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={fare}
                        onChange={(e) => setFare(Number(e.target.value) || 0)}
                        className="text-center text-lg font-bold h-12"
                      />
                      <Button variant="outline" size="icon" onClick={() => setFare((f) => f + 100)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-center text-xs text-muted-foreground mt-1">
                      Auto fare based on {distanceKm.toFixed(1)} km × Rs {PER_KM_PRIVATE}/km
                    </div>
                  </div>

                  <Button
                    className="w-full h-12"
                    onClick={() => { setFareLocked(true); setScreen("summary"); }}
                  >
                    Done
                  </Button>
                </div>
              </>
            )}

            {screen === "comments" && (
              <>
                <Header title="Comments" />
                <div className="p-4 space-y-4">
                  <Textarea
                    placeholder="Add a comment for the driver..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={5}
                  />
                  <Button className="w-full h-12" onClick={() => { setCommentsSaved(comments); setScreen("summary"); }}>
                    Done
                  </Button>
                </div>
              </>
            )}

            {screen === "summary" && (
              <>
                <Header title="Ride details" />
                <div className="p-4 space-y-3">
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <div className="text-xs text-muted-foreground">Your fare</div>
                    <div className="text-2xl font-bold text-primary">Rs {fare.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {rideType === "private" && `${passengers} passenger(s) · ${distanceKm.toFixed(1)} km`}
                      {rideType === "shared" && `1 seat · ${distanceKm.toFixed(1)} km`}
                      {rideType === "parcel" && `Parcel delivery · ${distanceKm.toFixed(1)} km`}
                    </div>
                  </div>

                  <button
                    onClick={() => setScreen("when")}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted"
                  >
                    <CalIcon className="w-5 h-5 text-primary" />
                    <div className="flex-1 text-left text-sm">
                      {whenMode === "now" ? "Start now" : `${dateLabel()} • ${timeLabel()}`}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => setScreen("comments")}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted"
                  >
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div className="flex-1 text-left text-sm">
                      {commentsSaved || "Comments"}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <Button
                    className="w-full h-12 gap-2"
                    onClick={() => {
                      toast({ title: "Searching for driver…", description: "We'll notify you when a driver accepts." });
                      resetAll();
                    }}
                  >
                    <Search className="w-4 h-4" /> Find a Driver
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
        <MobileNav />
      </div>

      {mapPickerFor && (
        <MapPicker
          initial={fromPlace?.location || toPlace?.location}
          onClose={() => setMapPickerFor(null)}
          onConfirm={(p) => {
            if (mapPickerFor === "from" || (mapPickerFor === "any" && !fromPlace)) {
              setFromPlace(p); setFromText(p.address);
            } else {
              setToPlace(p); setToText(p.address);
            }
            setMapPickerFor(null);
          }}
        />
      )}

      {fareLocked ? null : null}

      <BecomeDriverDialog
        open={driverDialogOpen}
        onOpenChange={setDriverDialogOpen}
        onDone={() => { setIsDriver(true); navigate("/driver"); }}
      />
    </div>
  );
}
