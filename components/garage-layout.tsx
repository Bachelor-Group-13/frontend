"use client";

import { useState, useEffect } from "react";
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

type ParkingSpot = {
  id: number;
  spotNumber: string;
  isOccupied: boolean;
  occupiedBy: {
    license_plate: string | null;
    email: string | null;
    phone_number: string | null;
    user_id: string | null;
  } | null;
};

type Reservation = {
  spot_number: string;
  user_id: string;
  users: {
    license_plate: string | null;
    email: string | null;
    phone_number: string | null;
  }[];
};

export default function GarageLayout() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  useEffect(() => {
    const fetchUserAndReservations = async () => {
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

        const { data: reservations } = await supabase
          .from("reservations")
          .select(
            "spot_number, user_id, users(license_plate, email, phone_number)",
          )
          .eq("reservation_date", new Date().toISOString().split("T")[0]);

        console.log("Fetched reservations:", reservations);

        if (!reservations) {
          console.error("Failed to fetch reservations");
          return;
        }

        const typedReservations = reservations as unknown as Reservation[];

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
            occupiedBy: reservation?.users?.[0]
              ? {
                  license_plate: reservation.users[0].license_plate,
                  email: reservation.users[0].email,
                  phone_number: reservation.users[0].phone_number,
                  user_id: reservation.user_id,
                }
              : null,
          };
        });

        setParkingSpots(spots);
      }
    };

    fetchUserAndReservations();
  }, []);

  const handleReservation = async (actionType: "reserve" | "unreserve") => {
    if (!selectedSpot || !user) return;

    if (actionType === "reserve") {
      const { error } = await supabase.from("reservations").insert([
        {
          spot_number: selectedSpot.spotNumber,
          user_id: user.id,
          reservation_date: new Date().toISOString().split("T")[0],
        },
      ]);

      if (!error) {
        setParkingSpots((prev) =>
          prev.map((spot) =>
            spot.spotNumber === selectedSpot.spotNumber
              ? { ...spot, isOccupied: true, occupiedBy: user }
              : spot,
          ),
        );
      }
    } else if (actionType === "unreserve") {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("spot_number", selectedSpot.spotNumber)
        .eq("user_id", user.id);

      if (!error) {
        setParkingSpots((prev) =>
          prev.map((spot) =>
            spot.spotNumber === selectedSpot.spotNumber
              ? { ...spot, isOccupied: false, occupiedBy: null }
              : spot,
          ),
        );
      }
    }

    setSelectedSpot(null);
  };

  return (
    <div className="grid grid-cols-12 gap-2 bg-gray-50 p-4 rounded-lg">
      {/* Utgang */}
      <div className="col-span-12 text-center mb-4">
        <h1 className="text-xl font-bold text-red-600">UTGANG</h1>
      </div>

      {/* Parkingsplasser */}
      <div className="col-span-6 grid grid-cols-2 gap-4">
        {parkingSpots.map((spot) => (
          <HoverCard key={spot.id}>
            <HoverCardTrigger asChild>
              <div
                className={`h-24 flex justify-center items-center text-white font-bold cursor-pointer rounded ${
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
      {selectedSpot && (
        <AlertDialog
          open={!!selectedSpot}
          onOpenChange={() => setSelectedSpot(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedSpot.isOccupied
                  ? `Unreserve Spot ${selectedSpot.spotNumber}?`
                  : `Reserve Spot ${selectedSpot.spotNumber}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedSpot.isOccupied
                  ? "Do you want to make this spot available again?"
                  : "Do you want to reserve this spot for the rest of the day?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedSpot(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleReservation(
                    selectedSpot.isOccupied ? "unreserve" : "reserve",
                  )
                }
              >
                {selectedSpot.isOccupied ? "Unreserve" : "Reserve"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Kjørefelt */}
      <div className="col-span-2 flex items-center justify-center bg-gray-200">
        <p className="text-gray-800 font-bold rotate-90">Kjørefelt</p>
      </div>

      {/* Trapp / Inngang */}
      <div className="col-span-4 flex items-center justify-center">
        <div className="h-40 w-full bg-gray-800 text-white font-bold flex items-center justify-center rounded">
          TRAPP / INNGANG
        </div>
      </div>
    </div>
  );
}
