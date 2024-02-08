import { Box } from "@mui/material";
import { ReactNode, useEffect, useRef, useState } from "react";

interface BoundryWrapperProps {
  element: (props: { width: number; height: number; }) => ReactNode;
}

const BoundryWrapper = ({ element: Child }: BoundryWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      const bound = element.getBoundingClientRect();
      setWidth(bound.width);
      setHeight(bound.height);
    })
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [])
  return (
    <Box ref={ref} width={1} height={1} position="relative" overflow="hidden">
      <Box sx={{
        width: 1,
        height: 1,
        top: "50%",
        left: "50%",
        position: "absolute",
        transform: "translate(-50%, -50%)",
      }}>
        {ref.current && height != null && width != null &&
          <Child height={height} width={width} />
        }
      </Box>
    </Box>
  )
}

export default BoundryWrapper;
