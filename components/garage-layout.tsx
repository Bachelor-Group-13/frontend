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
import { ParkingSpotDetection } from "./parking-spot-detection";
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
import { ParkingSpot, ParkingSpotBoundary, Vehicle } from "@/utils/types";
import { useLicensePlateDetection } from "@/hooks/useLicensePlateDetection";
import { Badge } from "./ui/badge";

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
  const [visualGarageSpots, setVisualGarageSpots] = useState<ParkingSpot[]>([]);
  const [activeTab, setActiveTab] = useState<string>("garage");
  const [detectedVehicles, setDetectedVehicles] = useState<Vehicle[]>([]);

  const { parkingSpots, user, fetchUserAndReservations } =
    useGarageReservations();

  const { platesInfo } = useLicensePlateDetection();

  useEffect(() => {
    if (
      detectedVehicles.length === 0 ||
      detectedSpots.length === 0 ||
      activeTab !== "detection"
    )
      return;

    const matchedSpots: ParkingSpotBoundary[] = detectedSpots.map((spot) => {
      const vehicleMatch = detectedVehicles.find((vehicle) => {
        const [cx, cy] = vehicle.center;
        const [x1, y1, x2, y2] = spot.boundingBox;
        return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
      });

      return {
        ...spot,
        isOccupied: !!vehicleMatch,
        vehicle: vehicleMatch ?? null,
      };
    });

    const detectedSpotNumbers = matchedSpots
      .filter((spot) => spot.vehicle?.licensePlate)
      .map((spot) => ({
        spotNumber: spot.spotNumber,
        licensePlate: spot.vehicle!.licensePlate!,
      }));

    if (detectedSpotNumbers.length === 0) return;

    const reserveDetected = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        for (const { spotNumber, licensePlate } of detectedSpotNumbers) {
          try {
            await api.post("/api/reservations", {
              spotNumber,
              licensePlate,
              reservationDate: today,
            });
          } catch (error) {
            console.error(`Failed to reserve spot ${spotNumber}`, error);
          }
        }

        await fetchUserAndReservations();
      } catch (error) {
        console.error("Batch reservation error", error);
      }
    };

    reserveDetected();
  }, [detectedVehicles, activeTab]);

  function isInsideBox(
    center: [number, number],
    box: [number, number, number, number]
  ) {
    const [x, y] = center;
    const [x1, y1, x2, y2] = box;
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }

  useEffect(() => {
    if (detectedVehicles.length === 0 || platesInfo.length === 0) return;

    const enrichedVehicles = detectedVehicles.map((vehicle) => {
      const matchingPlate = platesInfo.find((plateInfo: any) =>
        isInsideBox(vehicle.center, plateInfo.boundingBox)
      );

      return {
        ...vehicle,
        licensePlate: matchingPlate?.plate || null,
      };
    });

    setDetectedVehicles(enrichedVehicles);
  }, [detectedVehicles, platesInfo]);

  useEffect(() => {
    if (activeTab === "garage") {
      fetchUserAndReservations();
    }
  }, [activeTab, fetchUserAndReservations]);

  useEffect(() => {
    if (activeTab !== "garage") return;

    const updated = parkingSpots.map((spot) => {
      const match = detectedSpots.find((d) => d.spotNumber === spot.spotNumber);
      return {
        ...spot,
        isOccupied: match?.isOccupied ?? spot.isOccupied,
      };
    });

    setVisualGarageSpots(updated);
  }, [parkingSpots, detectedSpots, activeTab]);

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="garage" className="flex items-center">
            <CircleParking className="mr-2 h-4 w-4" />
            Garage Layout
          </TabsTrigger>
          <TabsTrigger value="detection" className="flex items-center">
            <Camera className="mr-2 h-4 w-4" />
            Detect Parking Spots
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <Card className="border-0 bg-gray-50 shadow-sm">
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Parking Status */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Your Parking Status</h2>

                  {/* Static for now - will be dynamic later */}
                  <div className="rounded-lg border-2 border-red-500 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-red-600">
                        Inneparkert
                      </h3>
                      <Badge className="bg-red-500">Parked In</Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Your vehicle is currently parked in spot 2A
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <Car className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">AB12345</span>
                    </div>
                  </div>

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

                    {/* Example vehicle - will be dynamic later */}
                    <div className="space-y-3">
                      <div className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                              ON
                            </div>
                            <div>
                              <p className="font-medium">Ola Nordmann</p>
                              <p className="text-xs text-gray-500">
                                Spot 1A (In front of you)
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href="tel:12345678"
                              className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                            <a
                              href="mailto:ola@example.com"
                              className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                            <a
                              href="sms:12345678"
                              className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                              KL
                            </div>
                            <div>
                              <p className="font-medium">Kari Larsen</p>
                              <p className="text-xs text-gray-500">
                                Spot 3A (Behind you)
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href="tel:87654321"
                              className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                            <a
                              href="mailto:kari@example.com"
                              className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                            <a
                              href="sms:87654321"
                              className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
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
                  {visualGarageSpots.map((spot) => (
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
                onSpotsDetected={(spots, vehicles) => {
                  console.log("Detected spots:", spots);
                  setDetectedSpots(spots);
                  setDetectedVehicles(vehicles);
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
