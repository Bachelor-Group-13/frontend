import { useState, useCallback, useEffect } from "react";
import { ParkingSpot } from "@/lib/utils/types";
import {
  fetchUserDetails,
  fetchReservations,
  createInitialParkingSpots,
  updateParkingSpotsWithReservations,
} from "../services/garageService";

/**
 * Represents a user with their personal and vehicle information.
 * @property {number} id - The unique identifier for the user
 * @property {string|null} license_plate - The user's primary license plate
 * @property {string|null} second_license_plate - The user's secondary license plate
 * @property {string} email - The user's email address
 * @property {string} phone_number - The user's phone number
 * @property {string} name - The user's full name
 * @property {string} role - The user's role in the system
 * @property {Object|null} current_reservation - The user's active parking reservation
 * @property {any} vehicle - Additional vehicle information
 */
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

/**
 * A hook that manages user and parking spot state for the garage.
 *
 * It fetches user details and reservations, then maps them to the UI
 * parking spot state.
 *
 * @returns An object containing:
 *   - parkingSpots: Array of parking spots with their current status
 *   - setParkingSpots: Function to update parking spots state
 *   - user: Current user information
 *   - setUser: Function to update user state
 *   - fetchUserAndReservations: Function to refresh user and reservation data
 */
export function useGarageReservations() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Fetches user details and reservation data for today, and updates state.
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
