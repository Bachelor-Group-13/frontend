import { api } from "@/lib/api/auth";
import { ParkingSpot } from "@/lib/utils/types";

type Reservation = {
  id?: number;
  spotNumber: string;
  licensePlate: string;
  userName?: string | null;
  userEmail?: string | null;
  userPhoneNumber?: string | null;
  userId: number;
  estimatedDeparture?: string | null;
  anonymous?: boolean;
  blockedSpot?: boolean;
};

/**
 * Fetches the current user's details from the API.
 *
 * @returns The user's details
 */
export async function fetchUserDetails() {
  const userRes = await api.get("/api/auth/me");
  return userRes.data;
}

/**
 * Fetches parking spot reservations for a specific date.
 *
 * @param {string} date - The date to fetch reservations for
 * @returns Array of reservations for the specified date
 */
export async function fetchReservations(date: string): Promise<Reservation[]> {
  const reservationsRes = await api.get<Reservation[]>(
    `/api/reservations/date/${date}`
  );
  return reservationsRes.data;
}

/**
 * Creates an initial array of parking spots with reservation data.
 *
 * @param {Reservation[]} reservations - Array of current reservations
 * @returns {ParkingSpot[]} Array of parking spots with reservation data
 */
export function createInitialParkingSpots(
  reservations: Reservation[]
): ParkingSpot[] {
  return Array.from({ length: 10 }, (_, i) => {
    const row = Math.floor(i / 2) + 1;
    const col = i % 2 === 0 ? "A" : "B";
    const spotNumber = `${row}${col}`;

    const reservation = reservations.find(
      (res) => res.spotNumber === spotNumber
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
            email: reservation.userEmail ?? null,
            phone_number: reservation.userPhoneNumber ?? null,
            user_id: reservation.userId.toString(),
            estimatedDeparture: reservation.estimatedDeparture ?? null,
          }
        : null,
      vehicle: null,
    };
  });
}

/**
 * Updates existing parking spots with new reservation data.
 *
 * @param {ParkingSpot[]} currentSpots - Current array of parking spots
 * @param {Reservation[]} reservations - Array of new reservations
 * @returns Updated array of parking spots
 */
export function updateParkingSpotsWithReservations(
  currentSpots: ParkingSpot[],
  reservations: Reservation[]
): ParkingSpot[] {
  return currentSpots.map((spot) => {
    const reservation = reservations.find(
      (res) => res.spotNumber === spot.spotNumber
    );

    if (reservation) {
      const isAnonymous = reservation.anonymous ?? false;
      const isBlocked = reservation.blockedSpot ?? false;

      return {
        ...spot,
        isOccupied: true,
        anonymous: isAnonymous,
        blockedSpot: isBlocked,
        occupiedBy: {
          anonymous: isAnonymous,

          license_plate: reservation.licensePlate,
          second_license_plate: null,

          name: isAnonymous ? null : (reservation.userName ?? null),
          email: isAnonymous ? null : (reservation.userEmail ?? null),
          phone_number: isAnonymous
            ? null
            : (reservation.userPhoneNumber ?? null),

          user_id:
            isAnonymous || reservation.userId == null
              ? null
              : reservation.userId.toString(),

          estimatedDeparture: reservation.estimatedDeparture ?? null,
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
