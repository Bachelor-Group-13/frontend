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
                    name: reservation.userName || null,
                    email: reservation.userEmail,
                    phone_number: reservation.userPhoneNumber,
                    user_id: reservation.userId,
                    estimatedDeparture: reservation.estimatedDeparture,
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

          console.log(`Mapping spot ${spot.spotNumber}:`, {
            hasReservation: !!reservation,
            reservationDetails: reservation
              ? {
                  licensePlate: reservation.licensePlate,
                  userName: reservation.userName,
                  userEmail: reservation.userEmail,
                  userPhoneNumber: reservation.userPhoneNumber,
                  estimatedDeparture: reservation.estimatedDeparture,
                }
              : null,
          });

          if (reservation) {
            return {
              ...spot,
              isOccupied: true,
              occupiedBy: {
                license_plate: reservation.licensePlate,
                second_license_plate: null,
                name: reservation.userName || null,
                email: reservation.userEmail,
                phone_number: reservation.userPhoneNumber,
                user_id: reservation.userId,
                estimatedDeparture: reservation.estimatedDeparture,
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
      console.error("Error fetching reservations:", err);
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
