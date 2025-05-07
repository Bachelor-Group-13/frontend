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
import { NotificationToggle } from "./NotificationToggle";
import { useReservationActions } from "@/lib/hooks/useReservationActions";

export function GarageLayout() {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

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
    setActiveTab,
    setShowUnauthorizedAlert,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between pb-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Role:</span>{" "}
            {user?.role || "Not loaded"}
          </div>
        </div>

        <NotificationToggle user={user} />
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Garage</h1>
        <p className="text-gray-500">Reserve your parking spot</p>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="dashboard"
        className="w-full"
        onValueChange={setActiveTab}
      >
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
          <GarageDashboard user={user} parkingSpots={parkingSpots} />
        </TabsContent>

        {/* Garage Layout Tab */}
        <TabsContent value="garage" className="mt-6">
          <GarageMap
            parkingSpots={parkingSpots}
            onSpotSelect={setSelectedSpot}
            currentUserId={user?.id || null}
          />
        </TabsContent>

        {/* Detection Tab - Developers only tab */}
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

      {/* Dialogs */}
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

      <UnauthorizedDialog
        open={showUnauthorizedAlert}
        onOpenChange={setShowUnauthorizedAlert}
      />
    </div>
  );
}
