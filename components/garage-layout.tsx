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
import { Camera, CircleParking } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  const [activeTab, setActiveTab] = useState<string>("garage");

  const { parkingSpots, user, fetchUserAndReservations } =
    useGarageReservations();

  useEffect(() => {
    if (activeTab === "garage") {
      fetchUserAndReservations();
    }
  }, [activeTab, fetchUserAndReservations]);

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
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Garage</h1>
        <p className="text-gray-500">Reserve your parking spot</p>
        <div className="flex w-full max-w-md justify-center space-x-4">
          <Link href="/plate-recognition" className="w-full">
            <Button variant="outline" className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Detect License Plate
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="garage"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="garage" className="flex items-center">
            <CircleParking className="mr-2 h-4 w-4" />
            Garage Layout
          </TabsTrigger>
          <TabsTrigger value="detection" className="flex items-center">
            <Camera className="mr-2 h-4 w-4" />
            Detect Parking Spots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="garage" className="mt-6">
          <Card className="border-0 bg-gray-50 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-12 gap-4">
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
                <div className="hidden items-center justify-center rounded-lg bg-gray-200 md:col-span-2 md:flex">
                  <p className="rotate-90 whitespace-nowrap font-bold text-gray-600">
                    DRIVING LANE
                  </p>
                </div>

                {/* Stairs / Entrance */}
                <div className="ml-7 hidden items-center justify-center md:col-span-4 md:flex">
                  <div
                    className="flex h-40 w-full items-center justify-center rounded-lg bg-gray-800 font-bold
                      text-white"
                  >
                    STAIRS / ENTRANCE
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4 rounded-lg bg-white p-4 text-sm">
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-red-500"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detection" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detect Parking Spots</CardTitle>
              <CardDescription>
                Upload an image of the garage to automatically detect available
                spots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        className="rounded-md border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                      >
                        <p className="text-lg font-bold">{spot.spotNumber}</p>
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
        </TabsContent>
      </Tabs>

      {/* Reservasjon */}
      {selectedSpot && (
        <AlertDialog
          open={!!selectedSpot}
          onOpenChange={() => setSelectedSpot(null)}
        >
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
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
                    className="mt-2 block text-sm font-medium text-gray-700"
                  >
                    Select License Plate
                  </label>
                  <Select
                    value={selectedLicensePlate || ""}
                    onValueChange={setSelectedLicensePlate}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a license plate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={user.license_plate}>
                        {user.license_plate}
                      </SelectItem>
                      {user.second_license_plate && (
                        <SelectItem value={user.second_license_plate}>
                          {user.second_license_plate}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0">
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
                  className={
                    selectedSpot.isOccupied
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
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
