"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Camera, Mail, MessageCircle, Phone } from "lucide-react";
import { ParkingSpot, ReservationResponse } from "@/lib/types";
import { useSession } from "next-auth/react";
import axios from "axios";

/*
 * GarageLayout component:
 *
 * This component displays the layout of the garage, including parking spots
 * and their reservation status. It allows users to reserve or unreserve
 * parking spots and integrates with supabase
 */
export function GarageLayout() {
  // State variables using the useState hook
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<
    string | null
  >(null);

  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  /*
   * fetchUserAndReservations function:
   *
   * Fetches the list of reservations from the database
   */
  const fetchReservations = useCallback(async () => {
    if (!user) return;

    try {
      console.log("Fetching reservations...");
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(`/api/reservations?date=${today}`);

      if (!response.data) {
        console.error("Failed to fetch reservations");
        return;
      }

      const reservations = response.data;

      const spots = Array.from({ length: 14 }, (_, i) => {
        const spotNumber = `${Math.floor(i / 2) + 1}${String.fromCharCode(
          65 + (i % 2)
        )}`;
        const reservation: ReservationResponse | undefined = reservations.find(
          (res: ReservationResponse) => res.spot_number === spotNumber
        );

        return {
          id: i + 1,
          spotNumber,
          isOccupied: !!reservation,
          occupiedBy: reservation
            ? {
                license_plate: reservation.license_plate,
                second_license_plate: null,
                email: reservation.reserved_by.email,
                phone_number: reservation.reserved_by.phone_number,
                user_id: reservation.user_id,
              }
            : null,
        };
      });
    } catch (error) {
      console.error("Failed to fetch reservations", error);
    }
  }, [user]);

  // useEffect hook to fetch reservation data
  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [fetchReservations, user]);

  /*
   * handleReservation function:
   *
   * Handles the reservation or unreservation of a parking spot
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
          spot_number: selectedSpot.spotNumber,
          license_plate: selectedLicensePlate,
          reservation_date: new Date().toISOString().split("T")[0],
        });

        await axios.post("api/reservations", {
          spot_number: selectedSpot.spotNumber,
          license_plate: selectedLicensePlate,
          reservation_date: new Date().toISOString().split("T")[0],
        });
      } else if (actionType === "unreserve") {
        console.log(`Deleting reservation for spot ${selectedSpot.spotNumber}`);

        // Unreserves the selected spot
        await axios.delete(`/api/reservations`, {
          data: {
            spot_number: selectedSpot.spotNumber,
            reservation_date: new Date().toISOString().split("T")[0],
          },
        });
      }
      console.log("Spot reserved/unreserved successfully");
      await fetchReservations();
      setSelectedSpot(null);
    } catch (error) {
      console.error("Failed to reserve/unreserve spot", error);
      alert(`Failed to ${actionType} spot.`);
    }
  };

  /*
   * navigateToLicensePlateRecognition function:
   *
   * Navigates the user to the license plate recognition page.
   */
  const navigateToLicensePlateRecognition = () => {
    router.push("/license-plate");
  };

  return (
    <div className="grid grid-cols-12 gap-2 bg-gray-50 p-4 rounded-lg">
      {/* Header */}
      <div className="col-span-12 mb-4 flex flex-col items-center w-full md:flex-row md:justify-between">
        <div className="md:w-1/3" />
        <h1 className="text-xl font-bold text-red-600 mb-2 md:mb-0">
          Parkeringhus
        </h1>
        <div className="md:w-1/3 md:flex md:justify-end">
          <Button
            className="bg-neutral-900 p-6"
            onClick={navigateToLicensePlateRecognition}
          >
            <Camera className="mr-2 h-4 w-4" />
            Scan License Plate
          </Button>
        </div>
      </div>
      {/* Parkingsplasser */}
      <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4">
        {parkingSpots.map((spot) => (
          <HoverCard key={spot.id}>
            <HoverCardTrigger asChild>
              <div
                className={`h-24 flex justify-center items-center text-white
                          font-bold cursor-pointer rounded ${
                            spot.isOccupied ? "bg-red-600" : "bg-green-600"
                          }`}
                onClick={() => setSelectedSpot(spot)}
              >
                {spot.spotNumber}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-72">
              {spot.isOccupied && spot.occupiedBy ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    Skiltnr: {spot.occupiedBy.license_plate}
                  </h4>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <p>Email: {spot.occupiedBy.email}</p>
                    <a
                      href={`mailto:${spot.occupiedBy.email}`}
                      className="text-neutral-900 hover:text-blue-700"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <p>Phone: {spot.occupiedBy.phone_number}</p>
                    <div className="flex space-x-2">
                      <a
                        href={`tel:${spot.occupiedBy.phone_number}`}
                        className="text-neutral-900 hover:text-blue-700"
                      >
                        <Phone className="h-5 w-5" />
                      </a>
                      <a
                        href={`sms:${spot.occupiedBy.phone_number}`}
                        className="text-neutral-900 hover:text-green-700"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">This spot is available.</p>
              )}
            </HoverCardContent>
          </HoverCard>
        ))}
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
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedLicensePlate || ""}
                    onChange={(e) => setSelectedLicensePlate(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a license plate
                    </option>
                    <option value={user.licensePlate}>
                      {user.licensePlate}
                    </option>
                    {user.secondLicensePlate && (
                      <option value={user.secondLicensePlate}>
                        {user.secondLicensePlate}
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

      {/* Kjørefelt */}
      <div
        className="hidden md:col-span-2 md:flex items-center justify-center
        bg-gray-200"
      >
        <p className="text-neutral-900 font-bold rotate-90">Kjørefelt</p>
      </div>

      {/* Trapp / Inngang */}
      <div
        className="hidden md:col-span-4 md:flex items-center justify-center
        ml-7"
      >
        <div
          className="h-40 w-full bg-neutral-900 text-white font-bold flex
          items-center justify-center rounded"
        >
          TRAPP / INNGANG
        </div>
      </div>
    </div>
  );
}
