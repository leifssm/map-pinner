import { useState } from "react";
import { useAddLocationMutation, useGetLocationsFecther } from "./lib/api/swr-hooks";

const App = () => {
  const { error, isLoading } = useGetLocationsFecther();
  const { data, isMutating, trigger } = useAddLocationMutation();
  const [lat, setLat] = useState<string | undefined>();
  const [lon, setLon] = useState<string | undefined>();
  const [timestamp, setTimestamp] = useState<string | undefined>();
  console.log(data)

  return (
    <div>
      <h1>Hello!</h1>
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
      </div>
    </div>
  )
}

export default App
