"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
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
import { Camera } from "lucide-react";
import { ParkingSpot, ReservationResponse } from "@/lib/types";

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
  const [user, setUser] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);

  const router = useRouter();

  /*
   * fetchUserAndReservations function:
   *
   * Fetches the current users information and the list of reservations
   * from supabase.
   */
  const fetchUserAndReservations = useCallback(async () => {
    // Fetches user authentication data from supabase
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data: userDetails } = await supabase
        .from("users")
        .select("license_plate, email, phone_number")
        .eq("id", userData.user.id)
        .single();

      if (userDetails) {
        setUser({ id: userData.user.id, ...userDetails });
      }

      // Fetches reservations for the current date from the reservations table
      const { data: reservations } = await supabase
        .from("reservations")
        .select(
          `
           spot_number,
           user_id,
           reserved_by:users (
             license_plate,
             email,
             phone_number
           )
         `,
        )
        .eq("reservation_date", new Date().toISOString().split("T")[0]);

      if (!reservations) {
        console.error("Failed to fetch reservations");
        return;
      }

      const typedReservations =
        reservations as unknown as ReservationResponse[];

      // Array of parking spots with their reservation status
      const spots = Array.from({ length: 14 }, (_, i) => {
        const spotNumber = `${Math.floor(i / 2) + 1}${String.fromCharCode(
          65 + (i % 2),
        )}`;
        const reservation = typedReservations.find(
          (res) => res.spot_number === spotNumber,
        );

        return {
          id: i + 1,
          spotNumber,
          isOccupied: !!reservation,
          occupiedBy: reservation
            ? {
                license_plate: reservation.reserved_by.license_plate,
                email: reservation.reserved_by.email,
                phone_number: reservation.reserved_by.phone_number,
                user_id: reservation.user_id,
              }
            : null,
        };
      });

      setParkingSpots(spots);
    }
  }, []);

  // useEffect hook to fetch user and reservation data
  useEffect(() => {
    fetchUserAndReservations();
  }, [fetchUserAndReservations]);

  /*
   * handleReservation function:
   *
   * Handles the reservation or unreservation of a parking spot
   */
  const handleReservation = async (actionType: "reserve" | "unreserve") => {
    if (!selectedSpot || !user) return;

    // Checks if the user is authorized to unreserve the selected spot
    if (actionType === "unreserve") {
      if (selectedSpot.occupiedBy?.user_id !== user.id) {
        setShowUnauthorizedAlert(true);
        setSelectedSpot(null);
        return;
      }
    }

    // Reserve the selected spot
    if (actionType === "reserve") {
      const { error } = await supabase.from("reservations").insert([
        {
          spot_number: selectedSpot.spotNumber,
          user_id: user.id,
          reservation_date: new Date().toISOString().split("T")[0],
        },
      ]);

      if (!error) {
        // Refreshes the list of reservations
        await fetchUserAndReservations();
      }
    } else if (actionType === "unreserve") {
      // Unreserves the selected spot
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("spot_number", selectedSpot.spotNumber)
        .eq("user_id", user.id);

      if (!error) {
        await fetchUserAndReservations();
      }
    }

    setSelectedSpot(null);
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
                  <div className="text-sm text-gray-600">
                    <p>Email: {spot.occupiedBy.email}</p>
                    <p>Phone: {spot.occupiedBy.phone_number}</p>
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
                      selectedSpot.isOccupied ? "unreserve" : "reserve",
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
