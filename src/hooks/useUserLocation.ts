import { useState, useEffect } from 'react';

interface UserLocation {
  latitude: number;
  longitude: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocalización no disponible");
      setLocation({ latitude: -2.1894, longitude: -79.8890 }); // Fallback Guayaquil
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        console.warn("Error geolocalización:", err.message);
        setError(err.message);
        setLocation({ latitude: -2.1894, longitude: -79.8890 }); // Fallback
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, []);

  return { location, error, loading };
}
