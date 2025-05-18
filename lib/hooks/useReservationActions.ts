import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { api } from "@/lib/api/auth";
import {
  ParkingSpot,
  ParkingSpotBoundary,
  ReservationResponse,
  User,
} from "@/lib/utils/types";
import { useToast } from "@/lib/hooks/use-toast";

/**
 * Props for the useReservationActions hook.
 * @property {User|null} user - The current user
 * @property {ParkingSpot[]} parkingSpots - Array of parking spots
 * @property {Function} setParkingSpots - Function to update parking spots
 * @property {Function} fetchUserAndReservations - Function to refresh user and reservation data
 * @property {Function} setSelectedSpot - Function to update selected spot
 * @property {Function} setActiveTab - Function to update active tab
 * @property {Function} setShowUnauthorizedAlert - Function to show unauthorized alert
 */
interface UseReservationActionsProps {
  user: User | null;
  parkingSpots: ParkingSpot[];
  setParkingSpots: Dispatch<SetStateAction<ParkingSpot[]>>;
  fetchUserAndReservations: () => Promise<void>;
  setSelectedSpot: (spot: ParkingSpot | null) => void;
  setActiveTab: (tab: string) => void;
  setShowUnauthorizedAlert: (show: boolean) => void;
}

interface AnonymousReservation extends ReservationResponse {
  anonymous: boolean;
}

/**
 * A hook that manages parking spot reservation actions.
 *
 * @returns An object containing:
 *   - selectedLicensePlate: The currently selected license plate
 *   - setSelectedLicensePlate: Function to update selected license plate
 *   - estimatedDeparture: The estimated departure time
 *   - setEstimatedDeparture: Function to update estimated departure time
 *   - handleReservation: Function to handle spot reservation/unreservation
 *   - handleClaimSpot: Function to claim an anonymous spot
 *   - handleSpotsDetected: Function to process detected parking spots
 *   - isUpdating: Boolean indicating if an update is in progress
 */
export function useReservationActions({
  user,
  parkingSpots,
  setParkingSpots,
  fetchUserAndReservations,
  setSelectedSpot,
  setActiveTab,
  setShowUnauthorizedAlert,
}: UseReservationActionsProps) {
  const { toast } = useToast();
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<
    string | null
  >(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [estimatedDeparture, setEstimatedDeparture] = useState<Date | null>(
    null
  );

  // Handles reservation or unreservation of a parking spot
  const handleReservation = async (
    selectedSpot: ParkingSpot,
    actionType: "reserve" | "unreserve"
  ) => {
    if (!selectedSpot || !user) return;

    console.log(`Attempting to ${actionType} spot ${selectedSpot.spotNumber}`);

    if (actionType === "unreserve") {
      if (selectedSpot.occupiedBy?.user_id !== user.id) {
        console.warn("Unauthorized action");
        setShowUnauthorizedAlert(true);
        setSelectedSpot(null);
        return;
      }
    }

    try {
      if (actionType === "reserve") {
        if (!selectedLicensePlate) {
          alert("Please select a license plate.");
          return;
        }

        const userHasReserved = parkingSpots.some(
          (spot: ParkingSpot) => spot.occupiedBy?.user_id === user.id
        );

        if (userHasReserved) {
          alert("You already have a reserved spot today.");
          return;
        }

        console.log("Current estimatedDeparture state:", estimatedDeparture);

        const reservationData = {
          spotNumber: selectedSpot.spotNumber,
          userId: user.id,
          licensePlate: selectedLicensePlate,
          reservationDate: new Date().toISOString().split("T")[0],
          estimatedDeparture: estimatedDeparture
            ? estimatedDeparture.toISOString()
            : null,
        };

        console.log("Creating reservation with:", reservationData);

        await api.post("/api/reservations", reservationData);
        if (selectedSpot.spotNumber.endsWith("B")) {
          const row = selectedSpot.spotNumber.slice(0, -1);
          const aSpot = parkingSpots.find((s) => s.spotNumber === `${row}A`);
          const occupant = aSpot?.occupiedBy?.name ?? "an unknown driver";
          toast({
            title: "You parked someone in!",
            description: `You parked in ${occupant}.`,
          });
        } else {
          toast({
            title: "Spot reserved",
            description: `You reserved spot ${selectedSpot.spotNumber}.`,
          });
        }
      } else if (actionType === "unreserve") {
        console.log(`Deleting reservation for spot ${selectedSpot.spotNumber}`);

        const today = new Date().toISOString().split("T")[0];
        const reservationsResponse = await api.get(
          `/api/reservations/date/${today}`
        );
        const reservations = reservationsResponse.data;

        const reservation = reservations.find(
          (res: { spotNumber: string; userId: number }) =>
            res.spotNumber === selectedSpot.spotNumber &&
            res.userId === Number(user.id)
        );

        if (reservation) {
          await api.delete(`/api/reservations/${reservation.id}`);
          toast({
            title: "Spot unreserved",
            description: `You have successfully unreserved spot ${selectedSpot.spotNumber}.`,
          });
        } else {
          throw new Error("Reservation not found");
        }
      }

      console.log("Spot reserved/unreserved successfully");
      await fetchUserAndReservations();
      setSelectedSpot(null);
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Failed to reserve/unreserve spot", error);
      toast({
        variant: "destructive",
        title: "Failed to reserve/unreserve spot",
        description: `Failed to ${actionType} spot ${selectedSpot.spotNumber}.`,
      });
    }
  };

  // Claims an anonymous parking spot for the current user
  const handleClaimSpot = async (selectedSpot: ParkingSpot) => {
    if (!selectedSpot || !user || !selectedLicensePlate) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const reservationsResponse = await api.get(
        `/api/reservations/date/${today}`
      );
      const reservations: AnonymousReservation[] = reservationsResponse.data;

      const anonymousReservation = reservations.find(
        (res: AnonymousReservation) =>
          res.spotNumber === selectedSpot.spotNumber && res.anonymous
      );

      if (anonymousReservation) {
        await api.delete(`/api/reservations/${anonymousReservation.id}`);
      }

      const reservationData = {
        spotNumber: selectedSpot.spotNumber,
        userId: user.id,
        licensePlate: selectedLicensePlate,
        reservationDate: today,
        estimatedDeparture: estimatedDeparture
          ? estimatedDeparture.toISOString()
          : null,
      };

      await api.post("/api/reservations", reservationData);
      await fetchUserAndReservations();
      setSelectedSpot(null);
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Failed to claim spot:", error);
      if (error instanceof Error) {
        alert(`Failed to claim spot: ${error.message}`);
      } else {
        alert("Failed to claim spot: An unknown error occurred.");
      }
    }
  };

  // Processes detected parking spots and updated their status
  const handleSpotsDetected = useCallback(
    async (boundaries: ParkingSpotBoundary[]) => {
      setIsUpdating(true);

      setParkingSpots((currentSpots: ParkingSpot[]) =>
        currentSpots.map((dbSpot: ParkingSpot) => {
          const match = boundaries.find(
            (b) => b.spotNumber === dbSpot.spotNumber
          );

          const isBlockedSpot =
            dbSpot.spotNumber.endsWith("A") &&
            boundaries.some(
              (b) =>
                b.spotNumber === `${dbSpot.spotNumber.slice(0, -1)}B` &&
                b.isOccupied
            );

          return {
            ...dbSpot,
            isOccupied: match?.isOccupied ?? false,
            anonymous:
              isBlockedSpot &&
              match?.isOccupied &&
              !match?.vehicle?.licensePlate,
            blockedSpot: isBlockedSpot,
            vehicle: match?.vehicle ?? null,
            occupiedBy:
              match?.vehicle?.licensePlate != null
                ? {
                    license_plate: match.vehicle.licensePlate,
                    second_license_plate: null,
                    name: null,
                    email: null,
                    phone_number: null,
                    user_id: null,
                    estimatedDeparture: null,
                  }
                : isBlockedSpot && match?.isOccupied
                  ? {
                      license_plate: null,
                      second_license_plate: null,
                      name: null,
                      email: null,
                      phone_number: null,
                      user_id: null,
                      estimatedDeparture: null,
                      anonymous: true,
                    }
                  : null,
            detectedVehicle: match?.vehicle
              ? {
                  confidence: match.vehicle.confidence,
                  boundingBox: match.vehicle.boundingBox,
                  type: match.vehicle.type,
                  area: match.vehicle.area,
                  licensePlate: match.vehicle.licensePlate,
                }
              : undefined,
          };
        })
      );

      try {
        const today = new Date().toISOString().split("T")[0];
        const reservationPromises = [] as Promise<unknown>[];

        for (const b of boundaries) {
          if (b.isOccupied && b.vehicle?.licensePlate) {
            const userRes = await api.get(
              `/api/auth/license-plate/${b.vehicle.licensePlate}`
            );
            const u = userRes.data;
            if (u?.id) {
              const existing = await api.get(`/api/reservations/user/${u.id}`);
              const hasToday = existing.data.some(
                (r: { reservationDate: string }) => r.reservationDate === today
              );
              if (!hasToday) {
                reservationPromises.push(
                  api.post("/api/reservations", {
                    userId: u.id,
                    licensePlate: b.vehicle.licensePlate,
                    spotNumber: b.spotNumber,
                    reservationDate: today,
                  })
                );
              }
            }
          }

          if (b.spotNumber.endsWith("B") && b.isOccupied) {
            const rowNumber = b.spotNumber.slice(0, -1);
            const backSpot = boundaries.find(
              (spot) =>
                spot.spotNumber === `${rowNumber}A` &&
                spot.isOccupied &&
                !spot.vehicle?.licensePlate
            );

            if (backSpot) {
              try {
                const response = await api.post("/api/reservations", {
                  spotNumber: `${rowNumber}A`,
                  reservationDate: today,
                  anonymous: true,
                  blockedSpot: true,
                  userId: null,
                  licensePlate: null,
                  estimatedDeparture: null,
                });

                if (response.data && response.data.id) {
                  console.log("Anonymous reservation created:", response.data);
                } else {
                  console.error(
                    "Failed to create anonymous reservation:",
                    response.data
                  );
                }
              } catch (error) {
                console.error("Error creating anonymous reservation:", error);
              }
            }
          }
        }

        await Promise.all(reservationPromises);
        await fetchUserAndReservations();
        setActiveTab("dashboard");
      } catch (err) {
        console.error("Reservation flow failed:", err);
        alert("Failed to process reservations. See console.");
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUserAndReservations, setParkingSpots, setActiveTab]
  );

  return {
    selectedLicensePlate,
    setSelectedLicensePlate,
    estimatedDeparture,
    setEstimatedDeparture,
    handleReservation,
    handleClaimSpot,
    handleSpotsDetected,
    isUpdating,
  };
}
