import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api/auth";
import { ParkingSpotDetection } from "./ParkingSpotDetection";
import { ParkingSpotBoundary, Vehicle } from "@/lib/utils/types";

/**
 * Props for the GarageDetection component.
 * @param onSpotsDetected - Function to handle detected parking spots and vehicles
 * @param isUpdating - Whether the detection is currently updating
 * @param fetchUserAndReservations - Function to refresh user and reservation data
 */
interface GarageDetectionProps {
  onSpotsDetected: (
    boundaries: ParkingSpotBoundary[],
    vehicles: Vehicle[]
  ) => Promise<void>;
  isUpdating: boolean;
  fetchUserAndReservations: () => Promise<void>;
}

/**
 * A developer-only component for detecting parking spots and vehicles in the garage.
 *
 * This tool is only accessible to developers and includes features for:
 * - Testing parking spot detection
 * - Clearing all reservations
 *
 * @param {GarageDetectionProps} props - The props for the GarageDetection component
 */
export function GarageDetection({
  onSpotsDetected,
  isUpdating,
  fetchUserAndReservations,
}: GarageDetectionProps) {
  const handleClearAllReservations = async () => {
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parking Spot Detection</CardTitle>
        <CardDescription>
          Developer tool for detecting parking spots and vehicles in the garage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loading state when updating spots */}
        {isUpdating && (
          <div className="mb-4 rounded-md bg-blue-50 p-4 text-blue-800">
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <p>Updating parking spots with AI detection...</p>
            </div>
          </div>
        )}

        {/* Clear reservations section */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="text-sm text-gray-500">
              Clear all reservations from the system
            </p>
          </div>
          <Button variant="destructive" onClick={handleClearAllReservations}>
            Clear All Reservations
          </Button>
        </div>

        {/* Parking spot detection component */}
        <ParkingSpotDetection onSpotsDetected={onSpotsDetected} />
      </CardContent>
    </Card>
  );
}
