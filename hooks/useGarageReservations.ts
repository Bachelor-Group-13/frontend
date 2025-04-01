import { useState, useCallback } from "react";
import { api, getCurrentUser } from "@/utils/auth";
import { ParkingSpot } from "@/lib/types";

export function useGarageReservations() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchUserAndReservations = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      const userRes = await api.get(`/api/auth/${currentUser.id}`);
      const userDetails = userRes.data;
      setUser({
        id: userDetails.id,
        license_plate: userDetails.licensePlate,
        second_license_plate: userDetails.secondLicensePlate,
        email: userDetails.email,
        phone_number: userDetails.phoneNumber,
      });

      const today = new Date().toISOString().split("T")[0];
      const reservationsRes = await api.get(`/api/reservations/date/${today}`);
      const reservations = reservationsRes.data;

      const spots = Array.from({ length: 10 }, (_, i) => {
        const spotNumber = `${Math.floor(i / 2) + 1}${String.fromCharCode(
          65 + (i % 2)
        )}`;
        const reservation = reservations.find(
          (res: any) => res.spotNumber === spotNumber
        );

        return {
          id: i + 1,
          spotNumber,
          isOccupied: !!reservation,
          occupiedBy: reservation
            ? {
                license_plate: reservation.licensePlate,
                second_license_plate: null,
                name: null,
                email: reservation.user?.email,
                phone_number: reservation.user?.phoneNumber,
                user_id: reservation.userId,
              }
            : null,
        };
      });

      setParkingSpots(spots);
    } catch (err) {
      console.error("Error fetching reservations", err);
    }
  }, []);

  return {
    parkingSpots,
    setParkingSpots,
    user,
    setUser,
    fetchUserAndReservations,
  };
}
