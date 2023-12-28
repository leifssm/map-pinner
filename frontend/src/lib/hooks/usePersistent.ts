import { useMemo, useState } from "react"

export const usePersistent = <T>(value: T) => {
  const [persistent, setPersistent] = useState(value);
  const returnValue = useMemo(() => {
    if (value == null) return persistent;
    setPersistent(value);
    return value;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return returnValue;
}
