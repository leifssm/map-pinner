import { Alert, AlertProps, Box, Collapse, IconButton, Stack } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';

export interface CustomAlert {
  text: string;
  severity: AlertProps["severity"];
}

interface CustomAlertWithId extends CustomAlert {
  id: number;
  closed: boolean
}

export type AlertAdder = (alert: CustomAlert) => void;
export interface AlertHandlerProps {
  callback: React.MutableRefObject<AlertAdder | undefined>;
}

export const AlertHandler = ({ callback }: AlertHandlerProps) => {
  const idCounter = useRef(0);
  const getId = () => idCounter.current++;
  const [alerts, setAlerts] = useState<CustomAlertWithId[]>([]);
  useEffect(() => {
    callback.current = (alert: CustomAlert) => {
      setAlerts(alerts => [...alerts, {...alert, id: getId(), closed: false }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Box
      sx={t => ({
        position: "fixed",
        left: "50%",
        bottom: t.spacing(2),
        translate: "-50%",
        width: "100%",
        maxWidth: `min(500px, calc(100% - ${t.spacing(2)}))`,
        maxHeight: "50vh",
        overflowY: "scroll"
      })}
    >
      <Stack>
        {alerts.map(alert => (
          <Collapse
            key={alert.id}
            in={!alert.closed}
            onAnimationEnd={() => {
              setAlerts(alerts => alerts.filter(a => a.id !== alert.id));
            }}
          >
            <Alert
              sx={{ mt: 1 }}
              severity={alert.severity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    alert.closed = true;
                    setAlerts(alerts => [...alerts]);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {alert.text}
            </Alert>
          </Collapse>
        ))}
      </Stack>
    </Box>
  )
}
