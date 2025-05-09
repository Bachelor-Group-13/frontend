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

interface NearbyVehiclesProps {
  user: any;
  parkingSpots: ParkingSpot[];
}

export function NearbyVehicles({ user, parkingSpots }: NearbyVehiclesProps) {
  const nearbyVehicles = parkingSpots.filter((spot) => {
    if (
      !spot.isOccupied ||
      !spot.occupiedBy ||
      spot.occupiedBy.user_id === user?.id
    ) {
      return false;
    }

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
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Users className="h-5 w-5" />
        Vehicles Around You
      </h3>

      <div className="space-y-3">
        {nearbyVehicles.length > 0 ? (
          nearbyVehicles.map((spot) => {
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
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
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {spot.occupiedBy?.estimatedDeparture && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>
                                Leaving at{" "}
                                {format(
                                  new Date(spot.occupiedBy.estimatedDeparture),
                                  "HH:mm"
                                )}
                              </span>
                            </div>
                          )}
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
