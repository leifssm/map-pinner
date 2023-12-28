import { useEffect, useRef, useState } from "react";
import { useAddLocationMutation, useGetLocationsFetcher } from "./lib/api/swr-hooks";
import { Map } from "./lib/components/Map";
import { GPSContext } from "./lib/contexts";
import { useGPS } from "./lib/hooks/useGPSContext";
import BoundryWrapper from "./lib/components/BoundryWrapper";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AlertAdder, AlertHandler } from "./lib/components/AlertHandler";

const App = () => {
  const [gps, error] = useGPS();
  const addError = useRef<AlertAdder>();
  // const { error, isLoading } = useGetLocationsFetcher();
  // const { data, isMutating, trigger } = useAddLocationMutation();
  // const [lat, setLat] = useState<string | undefined>();
  // const [lon, setLon] = useState<string | undefined>();
  // const [timestamp, setTimestamp] = useState<string | undefined>();

  return (
    <GPSContext.Provider value={gps}>
      <RouterProvider router={router}/>
      {/* <h1>Hello!</h1>
      {error && <div>error: {error?.message}</div>}
      Latitude
      <input value={lat} onChange={e => setLat(e.target.value)} type="text" />
      Longitude
      <input value={lon} onChange={e => setLon(e.target.value)} type="text" />
      timestamp
      <input value={timestamp} onChange={e => setTimestamp(e.target.value)} type="text" />

      <button disabled={isMutating || isLoading} onClick={() => {
        const la = parseFloat(lat || "0");
        const lo = parseFloat(lon || "0");
        const ts = parseFloat(timestamp || "0");
        trigger({ lat: la, lon: lo, timestamp: ts})
      }}>Add</button>
      <div>
        {isLoading ? "Loading..." : data?.map((loc,i) => <div key={i}>{loc.lat} & {loc.lon} at {loc.timestamp}</div>)}
      </div> */}
      <AlertHandler callback={addError}/>
    </GPSContext.Provider>
  )
}

export default App
