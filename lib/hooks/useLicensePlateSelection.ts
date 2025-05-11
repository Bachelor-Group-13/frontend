import { useState } from "react";

/**
 * A hook that manages the selected license plate state.
 *
 * @returns An object containing:
 *   - selectedLicensePlate: The currently selected license plate
 *   - setSelectedLicensePlate: Function to update the selected license plate
 */
export function useLicensePlateSelection() {
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<
    string | null
  >(null);

  return {
    selectedLicensePlate,
    setSelectedLicensePlate,
  };
}
