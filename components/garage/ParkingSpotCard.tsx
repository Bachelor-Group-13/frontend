import { ParkingSpot } from "@/lib/utils/types";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import CarspotVisuals from "./ParkingSpotVisual";

/**
 * Props for the ParkingSpotCard component.
 * @param spot - The parking spot data to display
 * @param onClick - The function to call when the spot is clicked
 * @param currentUserId - The ID of the current user
 */
interface ParkingSpotCardProps {
  spot: ParkingSpot;
  onClick: () => void;
  currentUserId: string | null;
}

/**
 * A component that displays a single parking spot card.
 *
 * Shows spot status with different colors and a hover card with spot details.
 * @param {ParkingSpotCardProps} props - The props for the ParkingSpotCard component
 */
export function ParkingSpotCard({
  spot,
  onClick,
  currentUserId,
}: ParkingSpotCardProps) {
  useEffect(() => {
    console.log(`ParkingSpotCard ${spot.spotNumber}:`, {
      isOccupied: spot.isOccupied,
      occupiedBy: spot.occupiedBy,
      estimatedDeparture: spot.occupiedBy?.estimatedDeparture,
      parsedDate: spot.occupiedBy?.estimatedDeparture
        ? new Date(spot.occupiedBy.estimatedDeparture)
        : null,
    });
  }, [spot]);
  const isOwnSpot =
    spot.isOccupied && spot.occupiedBy?.user_id === currentUserId;

  const getSpotColor = () => {
    if (!spot.isOccupied) return "bg-green-600";
    if (isOwnSpot) return "bg-orange-500";
    if (spot.occupiedBy?.anonymous) return "bg-gray-500";
    return "bg-red-600";
  };

  return (
    <HoverCard key={spot.id}>
      {/* Main spot card that shows the spot number and status */}
      <HoverCardTrigger asChild>
        <div
          className={`flex h-24 cursor-pointer items-center justify-center rounded font-bold
            text-white ${getSpotColor()}`}
          onClick={onClick}
        >
          <span className="ml-2 items-center justify-center text-sm font-bold">
            {spot.spotNumber}
          </span>
          <div className="xs:w-full xs:h-full relative h-full w-full md:h-full md:w-full">
            <CarspotVisuals isAvailable={!spot.isOccupied} />
          </div>
        </div>
      </HoverCardTrigger>

      {/* Hover card content with spot details */}
      <HoverCardContent className="w-72">
        {spot.isOccupied && spot.occupiedBy ? (
          <div className="space-y-2">
            {/* Show different content for anonymous vs known vehicles */}
            {spot.occupiedBy.anonymous ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">
                  Unknown Vehicle
                </h4>
                <p className="text-sm text-gray-500">
                  This spot is occupied by an unidentified vehicle
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  Claim this spot
                </Button>
              </div>
            ) : (
              <>
                {/* Vehicle owner details */}
                <h4 className="text-sm font-semibold">
                  Name: {spot.occupiedBy.name}
                </h4>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>License plate: {spot.occupiedBy.license_plate}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>Email: {spot.occupiedBy.email}</p>
                  <a
                    href={`mailto:${spot.occupiedBy.email}`}
                    className="text-neutral-900 hover:text-blue-700"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
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
              </>
            )}
            {/* Estimated departure time */}
            {spot.occupiedBy && spot.occupiedBy.estimatedDeparture && (
              <div className="flex items-center gap-2 pt-2 text-sm">
                <Clock className="h-4 w-4 text-xs text-gray-500" />
                <span className="text-xs text-gray-500">
                  Leaving at{" "}
                  {(() => {
                    try {
                      return format(
                        new Date(spot.occupiedBy?.estimatedDeparture),
                        "HH:mm"
                      );
                    } catch (error) {
                      console.error("Date format error:", error);
                      return "unknown time";
                    }
                  })()}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">This spot is available.</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
