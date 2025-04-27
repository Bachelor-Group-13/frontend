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
import Link from "next/link";
import {
  Camera,
  Car,
  CircleParking,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ParkingSpot } from "@/utils/types";
import { Badge } from "./ui/badge";
import { ParkingSpotDetection } from "./parking-spot-detection";
import { ParkingSpotBoundary, Vehicle } from "@/utils/types";

/*
 * GarageLayout component:
 *
 * This component displays the layout of the garage, including parking spots
 * and their reservation status. It allows users to reserve or unreserve
 * parking spots and integrates with the Spring Boot backend
 */
export function GarageLayout() {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const { parkingSpots, user, fetchUserAndReservations } =
    useGarageReservations();

  useEffect(() => {
    // Fetch data on initial load and when switching to either dashboard or garage tab
    if (activeTab === "garage" || activeTab === "dashboard") {
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

        const userHasReserved = parkingSpots.some(
          (spot) => spot.occupiedBy?.user_id === user.id
        );

        if (userHasReserved) {
          alert("You already have a reserved spot today.");
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
      // Switch to dashboard after successful reservation/unreservation
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Failed to reserve/unreserve spot", error);
      if (error instanceof Error) {
        alert(`Failed to reserve/unreserve spot: ${error.message}`);
      } else {
        alert("Failed to reserve/unreserve spot: An unknown error occurred.");
      }
    }
  };

  const isParkedIn = (spotNumber: string, spots: ParkingSpot[]): boolean => {
    // Find your spot's position
    const spotIndex = spots.findIndex((spot) => spot.spotNumber === spotNumber);
    if (spotIndex === -1) return false;

    // Get row and column from spot number (e.g., "1A" -> row 1, col 0)
    const row = Math.floor(spotIndex / 2);
    const col = spotIndex % 2;

    // Only check the adjacent spot in the same row (A checks B, B checks A)
    const adjacentSpotIndex = row * 2 + (col === 0 ? 1 : 0); // If in A (col 0), check B (col 1), and vice versa
    const adjacentSpot = spots[adjacentSpotIndex];

    // You're only parked in if the adjacent spot in your row is occupied
    return adjacentSpot && adjacentSpot.isOccupied;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Garage</h1>
        <p className="text-gray-500">Manage Parking Spot</p>
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
        defaultValue="dashboard"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList
          className={`grid w-full ${user?.role === "DEVELOPER" ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <TabsTrigger value="dashboard" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="garage" className="flex items-center">
            <CircleParking className="mr-2 h-4 w-4" />
            Garage Layout
          </TabsTrigger>
          {user?.role === "DEVELOPER" && (
            <TabsTrigger value="detection" className="flex items-center">
              <Camera className="mr-2 h-4 w-4" />
              Detect Spots
            </TabsTrigger>
          )}
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <Card className="border-0 bg-gray-50 shadow-sm">
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Parking Status */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Your Parking Status</h2>

                  {user && user.current_reservation ? (
                    <div className="rounded-lg border-2 border-red-500 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-red-600">
                          {isParkedIn(
                            user.current_reservation.spotNumber,
                            parkingSpots
                          )
                            ? "Inneparkert"
                            : "Parkert"}
                        </h3>
                        <Badge
                          className={
                            isParkedIn(
                              user.current_reservation.spotNumber,
                              parkingSpots
                            )
                              ? "bg-red-500"
                              : "bg-orange-500"
                          }
                        >
                          {isParkedIn(
                            user.current_reservation.spotNumber,
                            parkingSpots
                          )
                            ? "Parked In"
                            : "Parked"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Your vehicle is currently parked in spot{" "}
                        {user.current_reservation.spotNumber}
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <Car className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium">
                          {user.current_reservation.licensePlate}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-green-500 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-green-600">
                          Not Parked
                        </h3>
                        <Badge className="bg-green-500">Available</Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        You currently don't have any active parking reservations
                      </p>
                    </div>
                  )}

                  {/* Garage Stats */}
                  <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-lg font-semibold">
                      Garage Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md bg-green-50 p-3 text-center">
                        <p className="text-sm text-gray-600">Available Spots</p>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            parkingSpots.filter((spot) => !spot.isOccupied)
                              .length
                          }
                        </p>
                      </div>
                      <div className="rounded-md bg-red-50 p-3 text-center">
                        <p className="text-sm text-gray-600">Occupied Spots</p>
                        <p className="text-2xl font-bold text-red-600">
                          {
                            parkingSpots.filter((spot) => spot.isOccupied)
                              .length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nearby Vehicles */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Nearby Vehicles</h2>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                      <Users className="h-5 w-5" />
                      Vehicles Around You
                    </h3>

                    <div className="space-y-3">
                      {parkingSpots
                        .filter(
                          (spot) =>
                            spot.isOccupied &&
                            spot.occupiedBy &&
                            spot.occupiedBy.user_id !== user?.id
                        )
                        .map((spot) => (
                          <div key={spot.id} className="rounded-md border p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                                  {spot.occupiedBy?.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {spot.occupiedBy?.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Spot {spot.spotNumber}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {spot.occupiedBy?.phone_number && (
                                  <a
                                    href={`tel:${spot.occupiedBy.phone_number}`}
                                    className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </a>
                                )}
                                {spot.occupiedBy?.email && (
                                  <a
                                    href={`mailto:${spot.occupiedBy.email}`}
                                    className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </a>
                                )}
                                {spot.occupiedBy?.phone_number && (
                                  <a
                                    href={`sms:${spot.occupiedBy.phone_number}`}
                                    className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {parkingSpots.filter(
                        (spot) =>
                          spot.isOccupied &&
                          spot.occupiedBy &&
                          spot.occupiedBy.user_id !== user?.id
                      ).length === 0 && (
                        <p className="text-center text-gray-500">
                          No other vehicles currently parked
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Garage Layout Tab */}
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
                      currentUserId={user?.id || null}
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
                  <div className="mr-2 h-4 w-4 rounded-full bg-orange-500"></div>
                  <span>Your Spot</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-red-500"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detection Tab - Developers only tab */}
        {user?.role === "DEVELOPER" && (
          <TabsContent value="detection" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Parking Spot Detection</CardTitle>
                <CardDescription>
                  Developer tool for detecting parking spots and vehicles in the
                  garage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ParkingSpotDetection
                  onSpotsDetected={(
                    spots: ParkingSpotBoundary[],
                    vehicles: Vehicle[]
                  ) => {
                    console.log("Detected spots:", spots);
                    console.log("Detected vehicles:", vehicles);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Reservation Dialog */}
      {selectedSpot && (
        <AlertDialog
          open={!!selectedSpot}
          onOpenChange={() => setSelectedSpot(null)}
        >
          <AlertDialogContent className="sm:max-w-md">
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

      {/* Unauthorized Alert */}
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
