import { Map as PigeonMap, Marker as PigeonMarker } from "pigeon-maps"
import { useGPSContext } from "../hooks/useGPSContext";
import { useCallback, useMemo, useState } from "react";
import { useAddLocationMutation, useGetLocationsFetcher } from "api";
import { usePersistent } from "../hooks/usePersistent";
import { Box, Button, Collapse, IconButton, LinearProgress, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography, useTheme } from "@mui/material";
import { Edit as EditIcon, AddLocation as AddLocationIcon, RadioButtonChecked as RadioButtonCheckedIcon } from "@mui/icons-material";
import { transformLocation, transformLocations, Marker } from "../helpers/location";

const BIG_MARKER = 40;
const SMALL_MARKER = 25;
const GPS_MARKER = 20;

const standardLocation = [63.42241, 10.39514] as Marker;

interface MapProps {
  height: number;
  width: number;
}

const speedDialActions = [
  { icon: <AddLocationIcon />, name: 'Add' },
];

interface MapSpeedDialProps {
  forceAddSelection?: boolean;
}

const MapSpeedDial = ({ forceAddSelection }: MapSpeedDialProps) => {
  return (
    <SpeedDial
      ariaLabel="Add Location"
      sx={{ position: 'absolute', bottom: 16, right: 16 }}
      icon={
        <SpeedDialIcon
          icon={forceAddSelection && <AddLocationIcon />}
          openIcon={<AddLocationIcon />}
        />
      }
    >
      {speedDialActions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
        />
      ))}
    </SpeedDial>
  )
}

interface GPSIconProps {
  size?: number;
}

const GPSIcon = ({ size = GPS_MARKER }: GPSIconProps) => {
  const border = 3;
  const half = size / 2;
  return (
    <svg height={size} width={size}>
      <circle cx={half} cy={half} r={half - border} stroke="white" strokeWidth={border} fill="#8AE1FC" />
    </svg> 
  )
}

interface AddLocationPopupProps {
  location?: Marker | null;
}

const AddLocationPopup = ({ location }: AddLocationPopupProps) => {
  const t = useTheme()
  const { trigger, isMutating } = useAddLocationMutation();
  return (
    <Collapse
      in={!!location}
      orientation="horizontal"
      collapsedSize={10}
      sx={{
        position: "absolute",
        right: 0,
        bottom: 40,
        zIndex: t.zIndex.drawer
      }}
    >
      <Paper sx={t => ({ p: t.spacing(2) })}>
        <Typography>Vil du legge til lokasjonen din?</Typography>
        <Button disabled={!location || isMutating} onClick={() => {
            if (!location) return;
            trigger({
              description: "test",
              anchor: location,
              timestamp: Date.now()
            })
          }}
        >
          Ja
        </Button>
      </Paper>
    </Collapse>
  )
}

export const Map = ({ height, width }: MapProps) => {
  const location = useGPSContext();
  const userLocation = location ? transformLocation(location) : null;
  const defaultCenter = userLocation ?? standardLocation;

  const [selection, setSelection] = useState<Marker | null>(null);

  const [zoom, setZoom] = useState(11);
  const [center, setCenter] = useState(defaultCenter);

  const { data } = useGetLocationsFetcher();
  const persistantData = usePersistent(data);
  console.log(data)

  const { markers }  = useMemo(() => {
    const markers = transformLocations(persistantData || []);
    return { markers };
  }, [persistantData]);

  const selectMarker = useCallback((marker: Marker, updateZoom: boolean = false) => {
    setCenter(marker);
    const newZoom = Math.min(Math.max(15, zoom + (updateZoom ? 1 : 0)), 18);
    setZoom(newZoom);
  }, [setCenter, setZoom, zoom]);
  
  return (
    <Box height={height} width={width} position="relative">
      <PigeonMap 
        height={height}
        width={width}
        center={center}
        zoom={zoom} 
        onBoundsChanged={({ center, zoom }) => { 
          setCenter(center) 
          setZoom(zoom) 
        }}
        onClick={({ latLng }) => {
          setSelection(latLng)
          selectMarker(latLng)
        }}
      >
        {userLocation &&
          <PigeonMarker
            color="blue"
            width={GPS_MARKER}
            anchor={userLocation}
            onClick={() => selectMarker(userLocation, true)}
            style={{
              pointerEvents: "all",
              translate: "0 50%",
            }}
          >
            <GPSIcon />
          </PigeonMarker>
        }
        {selection &&
          <PigeonMarker
            color="green"
            width={BIG_MARKER}
            anchor={selection}
            onClick={() => selectMarker(selection, true)}
          ></PigeonMarker>
        }
        {persistantData?.map((marker) => 
          <PigeonMarker
            color="yellow"
            width={SMALL_MARKER}
            anchor={marker.anchor}
            onClick={() => selectMarker(marker.anchor)}
          />
        )}
      </PigeonMap>
      <MapSpeedDial forceAddSelection={!!selection}/>
      <AddLocationPopup location={selection} />
      <LinearProgress
        sx={{
          position: "absolute",
          bottom: location ? -20 : 0,
          left: 0,
          right: 0,
          transition: "bottom 1s"
        }} />
    </Box>
  )
}
