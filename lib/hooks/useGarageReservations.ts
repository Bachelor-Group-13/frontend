import { useState, useCallback, useEffect } from "react";
import { ParkingSpot } from "@/lib/utils/types";
import {
  fetchUserDetails,
  fetchReservations,
  createInitialParkingSpots,
  updateParkingSpotsWithReservations,
} from "../services/garageService";

interface User {
  id: number;
  license_plate: string | null;
  second_license_plate: string | null;
  email: string;
  phone_number: string;
  name: string;
  role: string;
  current_reservation: {
    spotNumber: string;
    licensePlate: string;
  } | null;
  vehicle: any;
}

export function useGarageReservations() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const fetchUserAndReservations = useCallback(async () => {
    try {
      const userDetails = await fetchUserDetails();
      console.log("User details from API:", userDetails);

      const today = new Date().toISOString().split("T")[0];
      const reservations = await fetchReservations(today);
      console.log(
        "Raw reservations from API:",
        JSON.stringify(reservations, null, 2)
      );

      const userReservation = reservations.find(
        (res: any) => res.userId === userDetails.id
      );
      console.log("User reservation found:", userReservation);

      setUser({
        id: userDetails.id,
        license_plate: userDetails.licensePlate,
        second_license_plate: userDetails.secondLicensePlate,
        email: userDetails.email,
        phone_number: userDetails.phoneNumber,
        name: userDetails.name,
        role: userDetails.role,
        current_reservation: userReservation
          ? {
              spotNumber: userReservation.spotNumber,
              licensePlate: userReservation.licensePlate,
            }
          : null,
        vehicle: null,
      });

      setParkingSpots((currentSpots) => {
        if (currentSpots.length === 0) {
          return createInitialParkingSpots(reservations);
        }
        return updateParkingSpotsWithReservations(currentSpots, reservations);
      });
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
  }, []);

  useEffect(() => {
    fetchUserAndReservations();
  }, [fetchUserAndReservations]);

  return {
    parkingSpots,
    setParkingSpots,
    user,
    setUser,
    fetchUserAndReservations,
  };
}
