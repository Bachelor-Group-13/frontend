import { useState } from "react";
import { api } from "@/lib/api/auth";

/**
 * Represents information about a license plate and its associated user.
 * @property {string} plate - The license plate number
 * @property {string} email - The user's email address
 * @property {string} name - The user's full name
 * @property {string} phone_number - The user's phone number
 */
type PlateUserInfo = {
  plate: string;
  email?: string;
  name: string;
  phone_number?: string;
};

/**
 * A hook that manages license plate detection and user information lookup.
 *
 * @returns An object containing:
 *   - platesInfo: Array of detected plates with user information
 *   - setPlatesInfo: Function to update plates information
 *   - handleLicensePlatesDetected: Function to process detected plates
 */
export function useLicensePlateDetection() {
  const [platesInfo, setPlatesInfo] = useState<PlateUserInfo[]>([]);

  // Processes detected license plates and fetched associated user information
  const handleLicensePlatesDetected = async (plates: string[]) => {
    const cleanedPlates = plates
      .filter((p): p is string => typeof p === "string")
      .map((p) => p.replace(/\s/g, ""));
    const results = await Promise.all(
      cleanedPlates.map(async (plate) => {
        const userInfo = await fetchLicensePlateInfo(plate);
        return userInfo
          ? {
              plate,
              email: userInfo.email,
              name: userInfo.name,
              phone_number: userInfo.phoneNumber,
            }
          : { plate, name: "" };
      })
    );

    setPlatesInfo(results);
  };

  // Fetches user information for a given license plate
  const fetchLicensePlateInfo = async (plate: string) => {
    try {
      const res = await api.get(`/api/auth/license-plate/${plate}`);
      if (res.data?.email) {
        return {
          email: res.data.email,
          name: res.data.name,
          phoneNumber: res.data.phoneNumber,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching plate info:", error);
      return null;
    }
  };

  return {
    platesInfo,
    setPlatesInfo,
    handleLicensePlatesDetected,
  };
}
