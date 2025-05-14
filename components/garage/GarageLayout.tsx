"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, CircleParking, LayoutDashboard } from "lucide-react";
import { useGarageReservations } from "@/lib/hooks/useGarageReservations";
import { ParkingSpot } from "@/lib/utils/types";
import { GarageDashboard } from "./GarageDashboard";
import { GarageMap } from "./GarageMap";
import { GarageDetection } from "./GarageDetection";
import { ReservationDialog } from "./dialogs/ReservationDialog";
import { UnauthorizedDialog } from "./dialogs/UnauthorizedDialog";
import { useReservationActions } from "@/lib/hooks/useReservationActions";
import Link from "next/link";
import { Button } from "../ui/button";
import { GaragePlateSearch } from "./GaragePlateSearch";
import { useLicensePlateDetection } from "@/lib/hooks/useLicensePlateDetection";
import { VehicleInfoDialog } from "./dialogs/VehicleInfoDialog";

/**
 * A layout component for managing garage operations.
 *
 * Provides a dashboard, garage layout map, and developer tools for detecting parking spots.
 * Integrates license plate scanning, reservation actions, and user role-based features.
 */
export function GarageLayout() {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [plateDialogOpen, setPlateDialogOpen] = useState(false);

  // Hooks for garage functionality
  const { parkingSpots, user, fetchUserAndReservations, setParkingSpots } =
    useGarageReservations();

  const {
    selectedLicensePlate,
    setSelectedLicensePlate,
    estimatedDeparture,
    setEstimatedDeparture,
    handleReservation,
    handleClaimSpot,
    handleSpotsDetected,
    isUpdating,
  } = useReservationActions({
    user,
    parkingSpots,
    setParkingSpots,
    fetchUserAndReservations,
    setSelectedSpot,
    setShowUnauthorizedAlert,
    setActiveTab: () => {},
  });

  const { platesInfo, handleLicensePlatesDetected } =
    useLicensePlateDetection();

  /**
   * Handles the manual search of a license plate.
   * Updates selected plate, fetches user/reservation data and opens a dialog.
   * @param {string} plate - The license plate to search for
   */
  const onManualSearch = (plate: string) => {
    setSelectedLicensePlate(plate);
    fetchUserAndReservations();
    handleLicensePlatesDetected([plate]);
    setPlateDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-4">
      {/* Header section */}
      <div
        className="mb-6 flex flex-col space-y-4 px-6 md:flex-row md:items-center md:justify-between
          md:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Garage</h1>
          <p className="text-gray-500">Reserve your parking spot</p>
        </div>

        {/* Desktop: Manual search box */}
        <div className="hidden md:block">
          <GaragePlateSearch onSearch={onManualSearch} />
        </div>
      </div>

      {/* Mobile: Scan License Plate button */}
      <div className="mb-6 block md:hidden">
        <Link href="/plate-recognition">
          <Button
            variant="outline"
            className="mx-auto flex w-full max-w-xs items-center justify-center"
          >
            <Camera className="mr-2 h-5 w-5" />
            Scan License Plate
          </Button>
        </Link>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="px-6">
          <TabsList
            className={`grid w-full ${
              user && user.role === "ROLE_DEVELOPER"
                ? "grid-cols-3"
                : "grid-cols-2"
              }`}
          >
            <TabsTrigger value="dashboard" className="flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="garage" className="flex items-center">
              <CircleParking className="mr-2 h-4 w-4" />
              Layout
            </TabsTrigger>
            {user && user.role === "ROLE_DEVELOPER" && (
              <TabsTrigger value="detection" className="flex items-center">
                <Camera className="mr-2 h-4 w-4" />
                Detect
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Dashboard tab content */}
        <TabsContent value="dashboard" className="mt-6">
          <GarageDashboard user={user} parkingSpots={parkingSpots} />
        </TabsContent>

        {/* Garage layout tab content */}
        <TabsContent value="garage" className="mt-6">
          <GarageMap
            parkingSpots={parkingSpots}
            onSpotSelect={setSelectedSpot}
            currentUserId={user?.id?.toString() || null}
          />
        </TabsContent>

        {/* Detection tab content - Developer only */}
        {user && user.role === "ROLE_DEVELOPER" && (
          <TabsContent value="detection" className="mt-6">
            <GarageDetection
              onSpotsDetected={handleSpotsDetected}
              isUpdating={isUpdating}
              fetchUserAndReservations={fetchUserAndReservations}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog components */}
      {selectedSpot && (
        <ReservationDialog
          selectedSpot={selectedSpot}
          setSelectedSpot={setSelectedSpot}
          user={user}
          selectedLicensePlate={selectedLicensePlate}
          setSelectedLicensePlate={setSelectedLicensePlate}
          estimatedDeparture={estimatedDeparture}
          setEstimatedDeparture={setEstimatedDeparture}
          handleReservation={() =>
            handleReservation(
              selectedSpot,
              selectedSpot.isOccupied ? "unreserve" : "reserve"
            )
          }
          handleClaimSpot={() => handleClaimSpot(selectedSpot)}
        />
      )}

      {/* Unauthorized alert dialog */}
      <UnauthorizedDialog
        open={showUnauthorizedAlert}
        onOpenChange={setShowUnauthorizedAlert}
      />

      {/* Vehicle info dialog */}
      <VehicleInfoDialog
        open={plateDialogOpen}
        onOpenChangeAction={setPlateDialogOpen}
        plateInfo={platesInfo.length > 0 ? platesInfo[0] : null}
      />
    </div>
  );
}
