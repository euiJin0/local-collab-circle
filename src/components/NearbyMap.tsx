import { useEffect, useRef, useState } from "react";
import type { Partner } from "@/lib/colabi";

declare global {
  interface Window {
    __colabiMapsReady?: () => void;
    gm_authFailure?: () => void;
  }
}

let loader: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as string | undefined;
  const channel = (import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as string | undefined) ?? "";
  if (!key) return Promise.reject(new Error("missing-key"));
  loader = new Promise<void>((resolve, reject) => {
    window.__colabiMapsReady = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=__colabiMapsReady&channel=${encodeURIComponent(channel)}&language=ko&region=KR`;
    s.async = true;
    s.onerror = () => {
      loader = null;
      reject(new Error("load-failed"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function pinIcon(fill: string, size: number): google.maps.Icon {
  const ring = cssVar("--card");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="${fill}" stroke="${ring}" stroke-width="3"/></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
    labelOrigin: new google.maps.Point(size / 2, size / 2 + 1),
  };
}

type Props = {
  center: { lat: number; lng: number };
  partners: Partner[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function NearbyMap({ center, partners, selectedId, onSelect }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    window.gm_authFailure = () => setError("지도를 불러올 권한이 없어요.");
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !el.current) return;
        map.current = new google.maps.Map(el.current, {
          center,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "simplified" }] },
          ],
        });
        new google.maps.Marker({
          map: map.current,
          position: center,
          icon: pinIcon(cssVar("--foreground"), 22),
          title: "내 위치",
          zIndex: 1,
        });
        setReady(true);
      })
      .catch(() => !cancelled && setError("지도를 불러오지 못했어요."));
    return () => {
      cancelled = true;
    };
    // center is fixed for this prototype
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !map.current) return;
    markers.current.forEach((m) => m.setMap(null));
    const creator = cssVar("--primary");
    const owner = cssVar("--secondary");
    markers.current = partners.map((p) => {
      const selected = p.id === selectedId;
      const m = new google.maps.Marker({
        map: map.current!,
        position: { lat: p.lat, lng: p.lng },
        icon: pinIcon(p.role === "creator" ? creator : owner, selected ? 52 : 40),
        label: { text: p.emoji, fontSize: selected ? "22px" : "17px" },
        title: p.name,
        zIndex: selected ? 10 : 2,
      });
      m.addListener("click", () => onSelectRef.current(p.id));
      return m;
    });
  }, [ready, partners, selectedId]);

  useEffect(() => {
    if (!ready || !map.current || !selectedId) return;
    const p = partners.find((x) => x.id === selectedId);
    if (p) map.current.panTo({ lat: p.lat, lng: p.lng });
  }, [ready, selectedId, partners]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-accent">
      <div ref={el} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {error ?? "지도를 불러오는 중…"}
        </div>
      )}
    </div>
  );
}
