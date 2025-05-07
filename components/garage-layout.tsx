"use client";

import { useState, useEffect, useCallback } from "react";
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
  Clock,
  LayoutDashboard,
  Loader2,
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
import { subscribeToPush } from "@/utils/push";
import { Switch } from "./ui/switch";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [estimatedDeparture, setEstimatedDeparture] = useState<Date | null>(
    null
  );

  const { parkingSpots, user, fetchUserAndReservations, setParkingSpots } =
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
      } else if (actionType === "unreserve") {
        console.log(`Deleting reservation for spot ${selectedSpot.spotNumber}`);

        // Find the reservation ID first
        const today = new Date().toISOString().split("T")[0];
        const reservationsResponse = await api.get(
          `/api/reservations/date/${today}`
        );
        const reservations = reservationsResponse.data;

        console.log(
          "Raw reservations from API:",
          JSON.stringify(reservations, null, 2)
        );
        console.log(
          "Sample reservation with estimatedDeparture:",
          reservations.find((r: any) => r.estimatedDeparture) || "None found"
        );

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

  const handleSpotsDetected = useCallback(
    async (boundaries: ParkingSpotBoundary[], _vehicles: Vehicle[]) => {
      setIsUpdating(true);

      // First update the UI with detected spots
      setParkingSpots((currentSpots) =>
        currentSpots.map((dbSpot) => {
          const match = boundaries.find(
            (b) => b.spotNumber === dbSpot.spotNumber
          );

          // Check if this is a blocked A spot
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
        const reservationPromises: Promise<any>[] = [];

        for (const b of boundaries) {
          // Handle regular reservations with license plates
          if (b.isOccupied && b.vehicle?.licensePlate) {
            const userRes = await api.get(
              `/api/auth/license-plate/${b.vehicle.licensePlate}`
            );
            const u = userRes.data;
            if (u?.id) {
              const existing = await api.get(`/api/reservations/user/${u.id}`);
              const hasToday = existing.data.some(
                (r: any) => r.reservationDate === today
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

          // Handle anonymous reservations for blocked A spots
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
        alert("Parking spots updated successfully with AI detection!");
        setActiveTab("dashboard");
      } catch (err) {
        console.error("Reservation flow failed:", err);
        alert("Failed to process reservations. See console.");
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUserAndReservations]
  );

  const isParkedIn = (spotNumber: string, spots: ParkingSpot[]): boolean => {
    const spotLetter = spotNumber.slice(-1);

    if (spotLetter !== "A") {
      return false;
    }

    const rowNumber = spotNumber.slice(0, -1);
    const correspondingBSpot = `${rowNumber}B`;

    const bSpot = spots.find((spot) => spot.spotNumber === correspondingBSpot);

    return bSpot ? bSpot.isOccupied : false;
  };

  const isBlockingCar = (mySpotNumber: string, otherSpotNumber: string) => {
    if (!mySpotNumber.endsWith("A")) return false;
    const row = mySpotNumber.slice(0, -1);
    return otherSpotNumber === `${row}B`;
  };

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) return;
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        setSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };
    checkSubscription();
  }, [user?.id]);

  const handleSubscribeClick = async () => {
    if (!user?.id) {
      alert("You need to be logged in to enable notifications");
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const existingSubscription =
        await registration?.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        setSubscribed(false);
      } else {
        await subscribeToPush(user.id);
        setSubscribed(true);
      }
    } catch (error) {
      console.error("Error managing push notifications:", error);
      alert("Failed to manage notification settings");
    }
  };

  const handleClaimSpot = async () => {
    if (!selectedSpot || !user || !selectedLicensePlate) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const reservationsResponse = await api.get(
        `/api/reservations/date/${today}`
      );
      const reservations = reservationsResponse.data;

      const anonymousReservation = reservations.find(
        (res: any) =>
          res.spotNumber === selectedSpot.spotNumber && res.anonymous === true
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between pb-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Role:</span>{" "}
            {user?.role || "Not loaded"}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Push Notifications</span>
            <Switch
              onCheckedChange={handleSubscribeClick}
              checked={subscribed}
              aria-label="Toggle notifications"
            />
            <span className="text-xs text-gray-500">
              {subscribed ? "On" : "Off"}
            </span>
          </div>
        </div>
      </div>
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
        defaultValue="dashboard"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList
          className={`grid w-full
            ${user && user.role === "ROLE_DEVELOPER" ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <TabsTrigger value="dashboard" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="garage" className="flex items-center">
            <CircleParking className="mr-2 h-4 w-4" />
            Garage Layout
          </TabsTrigger>
          {user && user.role === "ROLE_DEVELOPER" && (
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
                        .map((spot) => {
                          const isBlocking =
                            user?.current_reservation &&
                            isBlockingCar(
                              user.current_reservation.spotNumber,
                              spot.spotNumber
                            );

                          return (
                            <TooltipProvider key={spot.id} delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`relative rounded-md border p-3 ${
                                    isBlocking
                                        ? "border-red-500 bg-red-50"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                                          {spot.occupiedBy?.anonymous
                                            ? "?"
                                            : spot.occupiedBy?.name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </div>
                                        <div>
                                          <p className="font-medium">
                                            {spot.occupiedBy?.anonymous
                                              ? "Unknown Vehicle"
                                              : spot.occupiedBy?.name}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            Spot {spot.spotNumber}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {spot.occupiedBy
                                          ?.estimatedDeparture && (
                                          <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                              Leaving at{" "}
                                              {format(
                                                new Date(
                                                  spot.occupiedBy.estimatedDeparture
                                                ),
                                                "HH:mm"
                                              )}
                                            </span>
                                          </div>
                                        )}
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
                                </TooltipTrigger>
                                {isBlocking && (
                                  <TooltipContent side="top">
                                    🚗 This vehicle is blocking your car.
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}

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
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-gray-500"></div>
                  <span>Unknown Vehicle</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detection Tab - Developers only tab */}
        {user && user.role === "ROLE_DEVELOPER" && (
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
                {isUpdating && (
                  <div className="mb-4 rounded-md bg-blue-50 p-4 text-blue-800">
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <p>Updating parking spots with AI detection...</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Clear all reservations from the system
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Are you sure you want to clear ALL reservations? This action cannot be undone."
                        )
                      ) {
                        try {
                          await api.delete("/api/reservations/all");
                          await fetchUserAndReservations();
                          alert("All reservations cleared successfully");
                        } catch (error) {
                          console.error("Failed to clear reservations:", error);
                          alert("Failed to clear reservations");
                        }
                      }
                    }}
                  >
                    Clear All Reservations
                  </Button>
                </div>
                <ParkingSpotDetection onSpotsDetected={handleSpotsDetected} />
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
                {selectedSpot.isOccupied && selectedSpot.occupiedBy?.anonymous
                  ? `Claim Spot ${selectedSpot.spotNumber}?`
                  : selectedSpot.isOccupied &&
                      selectedSpot.occupiedBy?.user_id === user?.id
                    ? `Unreserve Spot ${selectedSpot.spotNumber}?`
                    : selectedSpot.isOccupied
                      ? `Spot ${selectedSpot.spotNumber} is Already Reserved`
                      : `Reserve Spot ${selectedSpot.spotNumber}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedSpot.isOccupied && selectedSpot.occupiedBy?.anonymous
                  ? "Do you want to claim this spot as yours?"
                  : selectedSpot.isOccupied &&
                      selectedSpot.occupiedBy?.user_id === user?.id
                    ? "Do you want to make this spot available again?"
                    : selectedSpot.isOccupied
                      ? "This spot is currently reserved by someone else."
                      : "Do you want to reserve this spot for the rest of the day?"}
              </AlertDialogDescription>
              {(!selectedSpot.isOccupied ||
                selectedSpot.occupiedBy?.anonymous) &&
                user && (
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Estimated Departure Time (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                            ring-offset-background file:border-0 file:bg-transparent file:text-sm
                            file:font-medium placeholder:text-muted-foreground focus-visible:outline-none
                            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            disabled:cursor-not-allowed disabled:opacity-50"
                          value={
                            estimatedDeparture
                              ? format(estimatedDeparture, "HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              const [hours, minutes] =
                                e.target.value.split(":");
                              const date = new Date();
                              const reservationDate = new Date()
                                .toISOString()
                                .split("T")[0];
                              date.setFullYear(
                                parseInt(reservationDate.split("-")[0]),
                                parseInt(reservationDate.split("-")[1]) - 1,
                                parseInt(reservationDate.split("-")[2])
                              );
                              date.setHours(
                                parseInt(hours),
                                parseInt(minutes),
                                0,
                                0
                              );
                              setEstimatedDeparture(date);
                            } else {
                              setEstimatedDeparture(null);
                            }
                          }}
                        />
                      </div>
                      {estimatedDeparture && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Estimated departure at{" "}
                            {format(estimatedDeparture, "HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0">
              <AlertDialogCancel onClick={() => setSelectedSpot(null)}>
                Cancel
              </AlertDialogCancel>
              {(!selectedSpot.isOccupied ||
                selectedSpot.occupiedBy?.user_id === user?.id ||
                selectedSpot.occupiedBy?.anonymous) && (
                <AlertDialogAction
                  onClick={() => {
                    if (selectedSpot.occupiedBy?.anonymous) {
                      handleClaimSpot();
                    } else {
                      handleReservation(
                        selectedSpot.isOccupied ? "unreserve" : "reserve"
                      );
                    }
                  }}
                  className={
                    selectedSpot.isOccupied &&
                    !selectedSpot.occupiedBy?.anonymous
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }
                >
                  {selectedSpot.occupiedBy?.anonymous
                    ? "Claim Spot"
                    : selectedSpot.isOccupied
                      ? "Unreserve"
                      : "Reserve"}
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
