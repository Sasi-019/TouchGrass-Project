import { useCallback, useState } from "react";

/**
 * Optional browser location.
 *
 * Nothing is requested until the user presses "Use my location", and the
 * coordinates live only in memory (never in localStorage). The app works the
 * same whether the status is "idle", "denied" or "unsupported".
 *
 * status: "idle" | "asking" | "granted" | "denied" | "unavailable" | "unsupported"
 */
export default function useBrowserLocation() {
  const [status, setStatus] = useState(
    typeof navigator !== "undefined" && "geolocation" in navigator
      ? "idle"
      : "unsupported"
  );
  const [coords, setCoords] = useState(null);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("asking");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      (error) => {
        setCoords(null);
        // 1 = permission denied; anything else = could not get a position.
        setStatus(error.code === 1 ? "denied" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  const clear = useCallback(() => {
    setCoords(null);
    setStatus("idle");
  }, []);

  return { status, coords, request, clear };
}
