import { useState } from "react";

/**
 * A hook that manages the estimated departure time for a reservation.
 *
 * @returns {Object} An object containing:
 *   - estimatedDeparture: The estimated departure time
 *   - setEstimatedDeparture: Function to update the estimated departure time
 */
export function useReservationTime() {
  const [estimatedDeparture, setEstimatedDeparture] = useState<Date | null>(
    null
  );

  return {
    estimatedDeparture,
    setEstimatedDeparture,
  };
}
