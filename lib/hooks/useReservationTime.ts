import { useState } from "react";

export function useReservationTime() {
  const [estimatedDeparture, setEstimatedDeparture] = useState<Date | null>(
    null
  );

  return {
    estimatedDeparture,
    setEstimatedDeparture,
  };
}
