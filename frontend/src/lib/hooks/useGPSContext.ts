import { useContext, useEffect, useRef, useState } from "react";
import { GPSContext } from "../contexts";
import { distanceBetweenLocationsSimplified } from "../helpers/location";

export interface Geolocation {
  lat: number;
  lon: number;
  accuracy: number;
}

export const useGPS = () => {
  const [location, setLocation] = useState<Geolocation | null>(null);
  const timestamp = useRef(0);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  useEffect(() => {
    if (location) return;
    const id = navigator.geolocation.watchPosition(position => {
      setError(null);
      const newLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }
      setLocation(prev => {
        if (timestamp.current > position.timestamp - 1000 * 60 * 5) return prev;
        return prev && distanceBetweenLocationsSimplified(prev, newLocation) < 10 ? prev : newLocation;
      });
      timestamp.current = position.timestamp;
    }, e => {
      setError(e);
    });
    return () => navigator.geolocation.clearWatch(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [location, error] as const; // as [Geolocation | null, GeolocationPositionError | null];
}

export const useGPSContext = () => {
  return useContext(GPSContext)
}