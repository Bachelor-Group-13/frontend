import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { ParkingSpot } from "@/lib/utils/types";
import { isParkedIn } from "@/lib/utils/parking";

/**
 * Props for the ParkingStatus component.
 * @param user - The current user data
 * @param parkingSpots - List of all parking spots in the garage
 */
interface ParkingStatusProps {
  user: any;
  parkingSpots: ParkingSpot[];
}

/**
 * A component that displays the current parking status of the user.
 *
 * Shows whether the user is parked, their spot number, and vehicle details.
 * @param {ParkingStatusProps} props - The props for the ParkingStatus component
 */
export function ParkingStatus({ user, parkingSpots }: ParkingStatusProps) {
  // Check if the user has any active parking reservations
  if (!user || !user.current_reservation) {
    return (
      <div className="rounded-lg border-2 border-green-500 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-600">Not Parked</h3>
          <Badge className="bg-green-500">Available</Badge>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          You currently don't have any active parking reservations
        </p>
      </div>
    );
  }

  // Check if the user is parked in a spot
  const isParkedInSpot = isParkedIn(
    user.current_reservation.spotNumber,
    parkingSpots
  );

  // If user is parked in a spot, display the status
  return (
    <div className="rounded-lg border-2 border-red-500 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-red-600">
          {isParkedInSpot ? "Inneparkert" : "Parkert"}
        </h3>
        <Badge className={isParkedInSpot ? "bg-red-500" : "bg-orange-500"}>
          {isParkedInSpot ? "Parked In" : "Parked"}
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
  );
}
