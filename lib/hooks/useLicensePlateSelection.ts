import { useState } from "react";

export function useLicensePlateSelection() {
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<
    string | null
  >(null);

  return {
    selectedLicensePlate,
    setSelectedLicensePlate,
  };
}
