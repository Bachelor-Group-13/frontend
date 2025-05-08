import { api } from "@/lib/api/auth";
import { ParkingSpot } from "@/lib/utils/types";

export async function fetchUserDetails() {
  const userRes = await api.get("/api/auth/me");
  return userRes.data;
}

export async function fetchReservations(date: string) {
  const reservationsRes = await api.get(`/api/reservations/date/${date}`);
  return reservationsRes.data;
}

export function createInitialParkingSpots(reservations: any[]): ParkingSpot[] {
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

export function updateParkingSpotsWithReservations(
  currentSpots: ParkingSpot[],
  reservations: any[]
): ParkingSpot[] {
  return currentSpots.map((spot) => {
    const reservation = reservations.find(
      (res: any) => res.spotNumber === spot.spotNumber
    );

    if (reservation) {
      return {
        ...spot,
        isOccupied: true,
        anonymous: reservation.anonymous ?? false,
        blockedSpot: reservation.blockedSpot ?? false,
        occupiedBy: {
          license_plate: reservation.licensePlate,
          second_license_plate: null,
          name: reservation.anonymous ? null : reservation.userName || null,
          email: reservation.anonymous ? null : reservation.userEmail,
          phone_number: reservation.anonymous
            ? null
            : reservation.userPhoneNumber,
          user_id: reservation.anonymous ? null : reservation.userId,
          estimatedDeparture: reservation.estimatedDeparture,
          anonymous: reservation.anonymous ?? false,
        },
        vehicle: null,
      };
    }

    return {
      ...spot,
      isOccupied: false,
      anonymous: false,
      blockedSpot: false,
      occupiedBy: null,
      vehicle: null,
    };
  });
}
