import { useState, useCallback } from "react";
import { api } from "@/utils/auth";
import { ParkingSpot } from "@/utils/types";

export function useGarageReservations() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchUserAndReservations = useCallback(async () => {
    try {
      const userRes = await api.get("/api/auth/me");
      const userDetails = userRes.data;

      console.log("User details from API:", userDetails);

      const today = new Date().toISOString().split("T")[0];
      const reservationsRes = await api.get(`/api/reservations/date/${today}`);
      const reservations = reservationsRes.data;

      const userReservation = reservations.find(
        (res: any) => res.userId === userDetails.id
      );

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
          return Array.from({ length: 10 }, (_, i) => {
            const row = Math.floor(i / 2) + 1;
            const col = i % 2 === 0 ? "A" : "B";
            const spotNumber = `${row}${col}`;

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
                    name: reservation.user?.name || null,
                    email: reservation.user?.email,
                    phone_number: reservation.user?.phoneNumber,
                    user_id: reservation.userId,
                  }
                : null,
              vehicle: null,
            };
          });
        }

        return currentSpots.map((spot) => {
          const reservation = reservations.find(
            (res: any) => res.spotNumber === spot.spotNumber
          );

          if (reservation) {
            return {
              ...spot,
              isOccupied: true,
              occupiedBy: {
                license_plate: reservation.licensePlate,
                second_license_plate: null,
                name: reservation.user?.name || null,
                email: reservation.user?.email,
                phone_number: reservation.user?.phoneNumber,
                user_id: reservation.userId,
              },
              vehicle: null,
            };
          }

          if (spot.isOccupied && spot.vehicle) {
            return {
              ...spot,
              isOccupied: true,
              occupiedBy: {
                license_plate: spot.vehicle.licensePlate || null,
                second_license_plate: null,
                name: null,
                email: null,
                phone_number: null,
                user_id: null,
              },
              vehicle: null,
            };
          }

          return {
            ...spot,
            isOccupied: false,
            occupiedBy: null,
            vehicle: null,
          };
        });
      });
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
