import { Clock, Mail, MessageCircle, Phone, Users } from "lucide-react";
import { format } from "date-fns";
import { ParkingSpot } from "@/lib/utils/types";
import { isBlockingCar } from "@/lib/utils/parking";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Props for the NearbyVehicles component.
 * @param user - The current user data
 * @param parkingSpots - List of all parking spots in the garage
 */
interface NearbyVehiclesProps {
  user: any;
  parkingSpots: ParkingSpot[];
}

/**
 * A component that displays information about vehicles parked near the user's spot.
 *
 * Shows contact information and estimated departure times for nearby vehicles.
 * Highlights vehicles that are blocking the user's car.
 * @param {NearbyVehiclesProps} props - The props for the NearbyVehicles component
 */
export function NearbyVehicles({ user, parkingSpots }: NearbyVehiclesProps) {
  // Filter out spots that are not occupied
  const nearbyVehicles = parkingSpots.filter((spot) => {
    if (
      !spot.isOccupied ||
      !spot.occupiedBy ||
      spot.occupiedBy.user_id === user?.id
    ) {
      return false;
    }

    // Filter out the blocking spot (B spot) if user has a reservation
    if (user?.current_reservation) {
      const rowNumber = user.current_reservation.spotNumber.slice(0, -1);
      if (spot.spotNumber === `${rowNumber}B`) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      {/* Component header */}
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Users className="h-5 w-5" />
        Vehicles Around You
      </h3>

      {/* List of nearby vehicles */}
      <div className="space-y-3">
        {nearbyVehicles.length > 0 ? (
          nearbyVehicles.map((spot) => {
            // Check if this vehicle is blocking the user's car
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
                      className={`relative rounded-md border p-3 ${isBlocking ? "border-red-500 bg-red-50" : ""}`}
                    >
                      {/* Vehicle owner details */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="hidden h-8 w-8 items-center justify-center rounded-full bg-neutral-900
                              text-white sm:flex"
                          >
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
                            {spot.occupiedBy?.estimatedDeparture && (
                              <p className="tex-xs text-gray-500">
                                Leaving at{" "}
                                {format(
                                  new Date(spot.occupiedBy.estimatedDeparture),
                                  "HH:mm"
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Contact and departure time information */}
                        <div className="flex gap-2">
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
                  {/* Tooltip for blocking vehicles */}
                  {isBlocking && (
                    <TooltipContent side="top">
                      🚗 This vehicle is blocking your car.
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })
        ) : (
          <p className="text-center text-gray-500">
            No other vehicles currently parked
          </p>
        )}
      </div>
    </div>
  );
}
