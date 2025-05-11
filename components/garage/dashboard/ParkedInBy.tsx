import { Clock, Mail, MessageCircle, Phone, Car } from "lucide-react";
import { format } from "date-fns";
import { ParkingSpot } from "@/lib/utils/types";
import { isParkedIn } from "@/lib/utils/parking";

/**
 * Props for the ParkedInBy component.
 * @param user - The current user data
 * @param parkingSpots - List of all parking spots in the garage
 */
interface ParkedInByProps {
  user: any;
  parkingSpots: ParkingSpot[];
}

/**
 * A component that displays information about the vehicle that is blocking the user's spot.
 *
 * Shows contact information and estimated departure time of the blocking vehicle.
 * Only renders when the user is parked in a spot and there is a blocking vehicle.
 * @param {ParkedInByProps} props - The props for the ParkedInBy component
 */
export function ParkedInBy({ user, parkingSpots }: ParkedInByProps) {
  // Return null if user has no active reservation
  if (!user?.current_reservation) {
    return null;
  }

  // Check if user is currently parked in their spot
  const isParkedInSpot = isParkedIn(
    user.current_reservation.spotNumber,
    parkingSpots
  );

  // Return null if user is not parked in their spot
  if (!isParkedInSpot) {
    return null;
  }

  // Find the blocking spot (B spot in the same row)
  const rowNumber = user.current_reservation.spotNumber.slice(0, -1);
  const blockingSpot = parkingSpots.find(
    (spot) => spot.spotNumber === `${rowNumber}B`
  );

  // Return null if no blocking vehicle is found
  if (!blockingSpot?.occupiedBy) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      {/* Component header */}
      <h3 className="mb-2.5 flex items-center gap-2 text-lg font-semibold">
        <Car className="h-5 w-5" />
        Parked In By
      </h3>

      {/* Blocking vehicle information card */}
      <div className="rounded-md border border-red-600 bg-red-50 p-2">
        <div className="flex items-center justify-between">
          {/* Vehicle owner details */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
              {blockingSpot.occupiedBy.anonymous
                ? "?"
                : blockingSpot.occupiedBy.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
            </div>
            <div>
              <p className="font-medium">
                {blockingSpot.occupiedBy.anonymous
                  ? "Unknown Vehicle"
                  : blockingSpot.occupiedBy.name}
              </p>
              <p className="text-xs text-gray-500">
                Spot {blockingSpot.spotNumber}
              </p>
            </div>
          </div>
          {/* Contact and departure time information */}
          <div className="flex gap-2">
            {blockingSpot.occupiedBy.estimatedDeparture && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  Leaving at{" "}
                  {format(
                    new Date(blockingSpot.occupiedBy.estimatedDeparture),
                    "HH:mm"
                  )}
                </span>
              </div>
            )}
            {blockingSpot.occupiedBy.phone_number && (
              <a
                href={`tel:${blockingSpot.occupiedBy.phone_number}`}
                className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
            {blockingSpot.occupiedBy.email && (
              <a
                href={`mailto:${blockingSpot.occupiedBy.email}`}
                className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {blockingSpot.occupiedBy.phone_number && (
              <a
                href={`sms:${blockingSpot.occupiedBy.phone_number}`}
                className="rounded-full p-2 text-neutral-900 hover:bg-gray-100"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
