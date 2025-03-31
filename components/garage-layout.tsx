"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Button } from "./ui/button";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { ParkingSpot, ParkingSpotBoundary, PlateUserInfo } from "@/lib/types";
import Webcam from "react-webcam";
import { api, getCurrentUser } from "@/utils/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ParkingSpotDetection } from "./parking-spot-detection";
import LicensePlateUpload from "./license-plate-upload";
import CarspotVisuals from "./carspot-visuals";

/*
 * GarageLayout component:
 *
 * This component displays the layout of the garage, including parking spots
 * and their reservation status. It allows users to reserve or unreserve
 * parking spots and integrates with the Spring Boot backend
 */
export function GarageLayout() {
  // State variables using the useState hook
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("garage");
  const [detectedSpots, setDetectedSpots] = useState<ParkingSpotBoundary[]>([]);
  const [platesInfo, setPlatesInfo] = useState<PlateUserInfo[]>([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  /*
   * fetchUserAndReservations function:
   *
   * Fetches the current users information and the list of reservations
   * from the Spring Boot backend.
   */
  const fetchUserAndReservations = useCallback(async () => {
    console.log("Fetching reservations...");

    try {
      const currentUser = getCurrentUser();

      if (!currentUser) {
        console.error("No authenticated user found");
        return;
      }

      console.log("User data:", currentUser);

      const userResponse = await api.get(`/api/auth/${currentUser.id}`);
      const userDetails = userResponse.data;

      if (userDetails) {
        setUser({
          id: userDetails.id,
          license_plate: userDetails.licensePlate,
          second_license_plate: userDetails.secondLicensePlate,
          email: userDetails.email,
          phone_number: userDetails.phoneNumber,
        });
      }

      const today = new Date().toISOString().split("T")[0];
      const reservationsResponse = await api.get(
        `/api/reservations/date/${today}`,
      );
      const reservations = reservationsResponse.data;

      console.log("Reservations:", reservations);

      if (!reservations) {
        console.error("Failed to fetch reservations");
        return;
      }

      const spots = Array.from({ length: 10 }, (_, i) => {
        const spotNumber = `${Math.floor(i / 2) + 1}${String.fromCharCode(
          65 + (i % 2),
        )}`;
        const reservation = reservations.find(
          (res: any) => res.spotNumber === spotNumber,
        );

        return {
          id: i + 1,
          spotNumber,
          isOccupied: !!reservation,
          occupiedBy: reservation
            ? {
                license_plate: reservation.licensePlate,
                second_license_plate: null,
                name: reservation.user?.name,
                email: reservation.user?.email,
                phone_number: reservation.user?.phoneNumber,
                user_id: reservation.userId,
              }
            : null,
        };
      });

      console.log("Parking spots:", spots);
      setParkingSpots(spots);
    } catch (error) {
      console.error("Error in fetchUserAndReservations:", error);
    }
  }, []);

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
          `/api/reservations/date/${today}`,
        );
        const reservations = reservationsResponse.data;

        const reservation = reservations.find(
          (res: { spotNumber: string; userId: number }) =>
            res.spotNumber === selectedSpot.spotNumber &&
            res.userId === user.id,
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

  /**
   * handleParkingSpotsDetected:
   * Handles the detected parking spots by setting the state
   * and logging the detected spots.
   * @param parkingSpots
   */
  const handleParkingSpotsDetected = (parkingSpots: ParkingSpotBoundary[]) => {
    setDetectedSpots(parkingSpots);
    console.log("Detected parking spots:", parkingSpots);
  };

  /**
   * handleLicensePlateDetected:
   * Handles the detected license plate by removing whitespace
   * and fetching associated user information.
   * @param plates
   */
  const handleLicensePlatesDetected = async (plates: string[]) => {
    const cleanedPlates = plates.map((p) => p.replace(/\s/g, ""));
    const results = await Promise.all(
      cleanedPlates.map(async (plate) => {
        const userInfo = await fetchLicensePlateInfo(plate);
        return userInfo
          ? {
              plate,
              email: userInfo.email,
              phone_number: userInfo.phoneNumber,
            }
          : { plate };
      }),
    );

    setPlatesInfo(results);
  };

  /**
   * fetchLicensePlateInfo:
   * Fetches user information from the backend based on the provided
   * license plate.
   * @param plate
   */
  const fetchLicensePlateInfo = async (plate: string) => {
    try {
      const response = await api.get(`/api/auth/license-plate/${plate}`);

      if (response.data && response.data.email) {
        return {
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
        };
      } else {
        console.log(`No user found for plate ${plate}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  };

  /**
   * capture:
   * Captures an image from the webcam and processes it to detect license plate
   */
  const capture = useCallback(async () => {
    if (webcamRef.current) {
      // Takes a screenshot from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const blob = await (await fetch(imageSrc)).blob();
        const file = new File([blob], "captured-image.jpg", {
          type: "image/jpeg",
        });

        // Sends the captured image to be processed
        handleWebcamImage(file);
        // Hides webcam after taking image
        setShowWebcam(false);
      }
    }
  }, [webcamRef]);

  /**
   * handleWebcamImage:
   * Sends captured image to the recognition API and handles response
   */
  const handleWebcamImage = async (image: File) => {
    const formData = new FormData();
    formData.append("image", image);

    try {
      // Sends the image to the recognition API
      const response = await api.post("/license-plate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.license_plates) {
        handleLicensePlatesDetected(response.data.license_plates);
      } else {
        console.error("License plate not found.");
      }
    } catch (err: any) {
      // Handles error during the API request
      console.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to detect license plate.",
      );
    }
  };

  // Configuration for the webcam
  const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: "environment",
  };

  return (
    <div className="grid grid-cols-12 gap-2 bg-gray-50 p-4 rounded-lg">
      {/* Header */}
      <div
        className="col-span-12 mb-4 flex flex-col items-center w-full
        md:flex-row md:justify-between"
      >
        <div className="md:w-1/3" />
        <h1 className="text-xl font-bold text-red-600 mb-2 md:mb-0">
          Parkeringhus
        </h1>
        <div className="md:w-1/3" />
      </div>

      {/* Tabs */}
      <div className="col-span-12">
        <Tabs
          defaultValue="garage"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="garage">Garage Layout</TabsTrigger>
            <TabsTrigger value="parking-detection">
              Parking Detection
            </TabsTrigger>
            <TabsTrigger value="license-plate">License Plate</TabsTrigger>
          </TabsList>

          {/* Garage Layout Tab */}
          <TabsContent value="garage" className="mt-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Parkingsplasser */}
              <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4">
                {parkingSpots.map((spot) => (
                  <HoverCard key={spot.id}>
                    <HoverCardTrigger asChild>
                      <div
                        className={`h-24 flex justify-center items-center text-white
                                  font-bold cursor-pointer rounded ${
                                    spot.isOccupied
                                      ? "bg-red-600"
                                      : "bg-green-600"
                                  }`}
                        onClick={() => setSelectedSpot(spot)}
                      >
                        <span className="justify-center items-center text-sm font-bold">
                  {spot.spotNumber}
                </span>
                <div className="relative w-full h-full md:h-full md:w-full xs:w-full xs:h-full">
                  <CarspotVisuals isAvailable={!spot.isOccupied}/>
                      </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-72">
                      {spot.isOccupied && spot.occupiedBy ? (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">
                            Skiltnr: {spot.occupiedBy.license_plate}
                          </h4>
                          <div
                            className="flex justify-between items-center
                            text-sm text-gray-600"
                          >
                            <p>Email: {spot.occupiedBy.email}</p>
                            <a
                              href={`mailto:${spot.occupiedBy.email}`}
                              className="text-neutral-900 hover:text-blue-700"
                            >
                              <Mail className="h-5 w-5" />
                            </a>
                          </div>
                          <div
                            className="flex justify-between items-center
                            text-sm text-gray-600"
                          >
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
                        <p className="text-sm text-gray-500">
                          This spot is available.
                        </p>
                      )}
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>

              {/* Kjørefelt */}
              <div
                className="hidden md:col-span-2 md:flex items-center justify-center
                bg-gray-200"
              >
                <p className="text-neutral-900 font-bold rotate-90">
                  Kjørefelt
                </p>
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
          </TabsContent>

          {/* Parking Detection Tab */}
          <TabsContent value="parking-detection" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Parking Spot Detection</CardTitle>
                <CardDescription>
                  Upload an image to detect parking spots.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ParkingSpotDetection
                  onVehiclesDetected={(vehicles) => {
                    console.log("Detected vehicles:", vehicles);
                  }}
                />

                {detectedSpots.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">
                      Detected Parking Spots
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {detectedSpots.map((spot) => (
                        <div
                          key={spot.id}
                          className="p-4 border rounded-md bg-gray-50"
                        >
                          <p className="font-bold text-lg">{spot.spotNumber}</p>
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

          {/* License Plate Tab */}
          <TabsContent value="license-plate" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>License Plate Recognition</CardTitle>
                <CardDescription>
                  Upload an image to detect the license plate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="bg-neutral-900"
                  onClick={() => setShowWebcam(!showWebcam)}
                >
                  {showWebcam ? "Hide Camera" : "Open Camera"}
                </Button>

                {showWebcam && (
                  <div className="relative">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      className="rounded-md"
                    />
                    <Button
                      onClick={capture}
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                    >
                      Capture
                    </Button>
                  </div>
                )}

                <LicensePlateUpload
                  onLicensePlatesDetected={handleLicensePlatesDetected}
                />

                {platesInfo.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-bold">Detected Plates:</h3>
                    {platesInfo.map((p) => (
                      <div key={p.plate} className="border p-2 rounded">
                        <p className="font-semibold">Plate: {p.plate}</p>
                        {p.email && p.phone_number ? (
                          <div>
                            <p>Email: {p.email}</p>
                            <p>Phone: {p.phone_number}</p>
                          </div>
                        ) : (
                          <p>No user found for this plate.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base
                    border-gray-300 focus:outline-none focus:ring-indigo-500
                    focus:border-indigo-500 sm:text-sm rounded-md"
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
    </div>
  );
}
