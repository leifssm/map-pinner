import { degreesToRadians } from "./math";
import { Geolocation } from "../hooks/useGPSContext";

export interface LocationType {
  lat: number;
  lon: number;
}

export const distanceBetweenLocations = (location1: LocationType, location2: LocationType) => {
  const { lat: lat1, lon: lon1 } = location1;
  const { lat: lat2, lon: lon2 } = location2;
  const R = 6371000; // Radius of the earth in m
  const dLat = degreesToRadians(lat2 - lat1);  // deg2rad below
  const dLon = degreesToRadians(lon2 - lon1); 
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in m
  return d;
}

const coordinateDistance = 100000 / 1.11;

export const distanceBetweenLocationsSimplified = (location1: LocationType, location2: LocationType) => {
  const latDiff = location1.lat - location2.lat
  const lonDiff = location1.lon - location2.lon
  const distance = Math.hypot(latDiff, lonDiff);
  return distance * coordinateDistance;
}

export type Marker = [number, number];
export type LocationList = Marker[];

export const transformLocation = (locations: Pick<Geolocation, "lat" | "lon">): Marker => {
  return [locations.lat, locations.lon];
}

export const transformLocations = (locations: Pick<Geolocation, "lat" | "lon">[]): LocationList => {
  return locations.map(transformLocation);
}
