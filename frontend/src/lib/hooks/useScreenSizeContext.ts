import { useContext, useEffect, useState } from "react";
import { ScreenSizeContext } from "../contexts";

export interface ScreenSize {
  width: number;
  height: number;
}

export const useScreenSize = () => {
  const [size, setSize] = useState<ScreenSize>({
    width: window.innerWidth,
    height: window.innerHeight
  });
  useEffect(() => {
    const watcher = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    };
    window.addEventListener("resize", watcher)
    return () => window.removeEventListener("resize", watcher);
  }, [])
  return size
}

export const useScreenSizeContext = () => {
  return useContext(ScreenSizeContext)
}