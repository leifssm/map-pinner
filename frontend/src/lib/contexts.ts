import { createContext } from "react";
import { Geolocation } from "./hooks/useGPSContext";
import { ScreenSize } from "./hooks/useScreenSizeContext";

const GPSContext = createContext<Geolocation | null>(null);
const ScreenSizeContext = createContext<ScreenSize | null>(null);

export { GPSContext, ScreenSizeContext };