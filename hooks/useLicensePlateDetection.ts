import { useState } from "react";
import { api } from "@/utils/auth";
import { PlateUserInfo } from "@/lib/types";

export function useLicensePlateDetection() {
  const [platesInfo, setPlatesInfo] = useState<PlateUserInfo[]>([]);

  const handleLicensePlatesDetected = async (plates: string[]) => {
    const cleanedPlates = plates.map((p) => p.replace(/\s/g, ""));
    const results = await Promise.all(
      cleanedPlates.map(async (plate) => {
        const userInfo = await fetchLicensePlateInfo(plate);
        return userInfo
          ? {
              plate,
              email: userInfo.email,
              phone_number: userInfo.phoneNumber,
            }
          : { plate };
      }),
    );

    setPlatesInfo(results);
  };

  const fetchLicensePlateInfo = async (plate: string) => {
    try {
      const res = await api.get(`/api/auth/license-plate/${plate}`);
      if (res.data?.email) {
        return {
          email: res.data.email,
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
