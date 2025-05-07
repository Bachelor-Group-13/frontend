import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { ParkingSpot } from "@/lib/utils/types";
import { isParkedIn } from "@/lib/utils/parking";

interface ParkingStatusProps {
  user: any;
  parkingSpots: ParkingSpot[];
}

export function ParkingStatus({ user, parkingSpots }: ParkingStatusProps) {
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

  const isParkedInSpot = isParkedIn(
    user.current_reservation.spotNumber,
    parkingSpots
  );

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
