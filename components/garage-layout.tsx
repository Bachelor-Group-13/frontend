"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { ParkingSpot, ParkingSpotBoundary } from "@/lib/types";
import { api } from "@/utils/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useGarageReservations } from "@/hooks/useGarageReservations";
import { ParkingSpotCard } from "./parkingspot-card";
import { ParkingSpotDetection } from "./parking-spot-detection";
import Link from "next/link";

/*
 * GarageLayout component:
 *
 * This component displays the layout of the garage, including parking spots
 * and their reservation status. It allows users to reserve or unreserve
 * parking spots and integrates with the Spring Boot backend
 */
export function GarageLayout() {
  // State variables using the useState hook
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<
    string | null
  >(null);
  const [detectedSpots, setDetectedSpots] = useState<ParkingSpotBoundary[]>([]);
  const [showDetectionCard, setShowDetectionCard] = useState(false);

  const { parkingSpots, user, fetchUserAndReservations } =
    useGarageReservations();

  useEffect(() => {
    fetchUserAndReservations();
  }, [fetchUserAndReservations]);

  /*
   * handleReservation function:
   *
   * Handles the reservation or unreservation of a parking spot
   * @param actionType
   */
  const handleReservation = async (actionType: "reserve" | "unreserve") => {
    if (!selectedSpot || !user) return;

    console.log(`Attempting to ${actionType} spot ${selectedSpot.spotNumber}`);

    // Checks if the user is authorized to unreserve the selected spot
    if (actionType === "unreserve") {
      if (selectedSpot.occupiedBy?.user_id !== user.id) {
        console.warn("Unauthorized action");
        setShowUnauthorizedAlert(true);
        setSelectedSpot(null);
        return;
      }
    }

    try {
      // Reserve the selected spot
      if (actionType === "reserve") {
        if (!selectedLicensePlate) {
          alert("Please select a license plate.");
          return;
        }

        console.log("Creating reservation with:", {
          spotNumber: selectedSpot.spotNumber,
          userId: user.id,
          licensePlate: selectedLicensePlate,
          reservationDate: new Date().toISOString().split("T")[0],
        });

        await api.post("/api/reservations", {
          spotNumber: selectedSpot.spotNumber,
          userId: user.id,
          licensePlate: selectedLicensePlate,
          reservationDate: new Date().toISOString().split("T")[0],
        });
      } else if (actionType === "unreserve") {
        console.log(`Deleting reservation for spot ${selectedSpot.spotNumber}`);

        // Find the reservation ID first
        const today = new Date().toISOString().split("T")[0];
        const reservationsResponse = await api.get(
          `/api/reservations/date/${today}`
        );
        const reservations = reservationsResponse.data;

        const reservation = reservations.find(
          (res: { spotNumber: string; userId: number }) =>
            res.spotNumber === selectedSpot.spotNumber && res.userId === user.id
        );

        if (reservation) {
          // Unreserve the selected spot
          await api.delete(`/api/reservations/${reservation.id}`);
        } else {
          throw new Error("Reservation not found");
        }
      }

      console.log("Spot reserved/unreserved successfully");
      await fetchUserAndReservations();
      setSelectedSpot(null);
    } catch (error) {
      console.error("Failed to reserve/unreserve spot", error);
      if (error instanceof Error) {
        alert(`Failed to reserve/unreserve spot: ${error.message}`);
      } else {
        alert("Failed to reserve/unreserve spot: An unknown error occurred.");
      }
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2 rounded-lg bg-gray-50 p-4">
      {/* Header */}
      <div
        className="col-span-12 mb-4 flex w-full flex-col items-center md:flex-row
          md:justify-between"
      >
        <div className="md:w-1/3" />
        <h1 className="mb-2 text-xl font-bold text-red-600 md:mb-0">
          Parking Garage
        </h1>
        <div className="md:w-1/3" />
      </div>
      <div
        className="col-span-12 mb-4 flex w-full flex-col items-center md:flex-row
          md:justify-between"
      >
        <Link href="/plate-recognition">
          <Button variant="outline">Detect License Plate</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="col-span-12">
        {/* Garage Layout Tab */}
        <div className="grid grid-cols-12 gap-4">
          {/* Parkingspots */}
          <div className="col-span-12 grid grid-cols-2 gap-4 md:col-span-6">
            {parkingSpots.map((spot) => (
              <ParkingSpotCard
                key={spot.id}
                spot={spot}
                onClick={() => setSelectedSpot(spot)}
              />
            ))}
          </div>

          {/* Driving lane */}
          <div className="hidden items-center justify-center bg-gray-200 md:col-span-2 md:flex">
            <p className="rotate-90 font-bold text-neutral-900">DRIVING LANE</p>
          </div>

          {/* Stairs / Entrance */}
          <div className="ml-7 hidden items-center justify-center md:col-span-4 md:flex">
            <div
              className="flex h-40 w-full items-center justify-center rounded bg-neutral-900 font-bold
                text-white"
            >
              STAIRS / ENTRANCE
            </div>
          </div>

          {/* Parking spots */}
          <div className="col-span-12 grid grid-cols-2 gap-4 md:col-span-6">
            <Button
              variant="outline"
              onClick={() => setShowDetectionCard((prev) => !prev)}
              className="w-full md:w-auto"
            >
              {showDetectionCard
                ? "Hide Detection Card"
                : "Show Detection Card"}
            </Button>
          </div>
          {showDetectionCard && (
            <div className="col-span-12">
              <Card>
                <CardHeader>
                  <CardTitle>Detect Parking Spots</CardTitle>
                  <CardDescription>
                    Upload an image of the garage to detect available spots.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ParkingSpotDetection
                    onSpotsDetected={(spots) => {
                      console.log("Detected spots:", spots);
                      setDetectedSpots(spots);
                    }}
                  />

                  {detectedSpots.length > 0 && (
                    <div className="mt-8">
                      <h2 className="mb-4 text-xl font-semibold">
                        Detected Parking Spots
                      </h2>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {detectedSpots.map((spot) => (
                          <div
                            key={spot.id}
                            className="rounded-md border bg-gray-50 p-4"
                          >
                            <p className="text-lg font-bold">
                              {spot.spotNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              Position: [{spot.boundingBox.join(", ")}]
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* License Plate Tab */}
      </div>

      {/* Reservasjon */}
      {selectedSpot && (
        <AlertDialog
          open={!!selectedSpot}
          onOpenChange={() => setSelectedSpot(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedSpot.isOccupied &&
                selectedSpot.occupiedBy?.user_id === user?.id
                  ? `Unreserve Spot ${selectedSpot.spotNumber}?`
                  : selectedSpot.isOccupied
                    ? `Spot ${selectedSpot.spotNumber} is Already Reserved`
                    : `Reserve Spot ${selectedSpot.spotNumber}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedSpot.isOccupied &&
                selectedSpot.occupiedBy?.user_id === user?.id
                  ? "Do you want to make this spot available again?"
                  : selectedSpot.isOccupied
                    ? "This spot is currently reserved by someone else."
                    : "Do you want to reserve this spot for the rest of the day?"}
              </AlertDialogDescription>
              {!selectedSpot.isOccupied && user && (
                <div className="mt-4">
                  <label
                    htmlFor="license-plate-select"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select License Plate
                  </label>
                  <select
                    id="license-plate-select"
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base
                      focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={selectedLicensePlate || ""}
                    onChange={(e) => setSelectedLicensePlate(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a license plate
                    </option>
                    <option value={user.license_plate}>
                      {user.license_plate}
                    </option>
                    {user.second_license_plate && (
                      <option value={user.second_license_plate}>
                        {user.second_license_plate}
                      </option>
                    )}
                  </select>
                </div>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedSpot(null)}>
                Cancel
              </AlertDialogCancel>
              {(!selectedSpot.isOccupied ||
                selectedSpot.occupiedBy?.user_id === user?.id) && (
                <AlertDialogAction
                  onClick={() =>
                    handleReservation(
                      selectedSpot.isOccupied ? "unreserve" : "reserve"
                    )
                  }
                >
                  {selectedSpot.isOccupied ? "Unreserve" : "Reserve"}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Unauthorized */}
      <AlertDialog
        open={showUnauthorizedAlert}
        onOpenChange={setShowUnauthorizedAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unauthorized Action</AlertDialogTitle>
            <AlertDialogDescription>
              You can only unreserve parking spots that you have reserved
              yourself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowUnauthorizedAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
