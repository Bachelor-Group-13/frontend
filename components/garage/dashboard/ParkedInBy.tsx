"use client";
import { Mail, MessageCircle, Phone, Car } from "lucide-react";
import { format } from "date-fns";
import { ParkingSpot, User } from "@/lib/utils/types";
import { isParkedIn } from "@/lib/utils/parking";
import { useEffect, useRef } from "react";
import { useToast } from "@/lib/hooks/use-toast";

/**
 * Props for the ParkedInBy component.
 * @param user - The current user data
 * @param parkingSpots - List of all parking spots in the garage
 */
interface ParkedInByProps {
  user: User | null;
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
  const { toast } = useToast();
  const hasToasted = useRef(false);

  useEffect(() => {
    const mySpot = user?.current_reservation?.spotNumber;
    if (!mySpot) return;

    if (!isParkedIn(mySpot, parkingSpots)) {
      hasToasted.current = false;
      return;
    }

    const row = mySpot.slice(0, -1);
    const blockingSpot = parkingSpots.find(
      (s) => s.spotNumber === `${row}B` && !!s.occupiedBy
    );

    if (!blockingSpot || !blockingSpot.occupiedBy) return;

    if (!hasToasted.current) {
      const driverName = blockingSpot.occupiedBy?.anonymous
        ? "an unknown driver"
        : blockingSpot.occupiedBy?.name;
      toast({
        variant: "destructive",
        title: "You've been parked in!",
        description: `You were parked in by ${driverName}.`,
      });
      hasToasted.current = true;
    }
  }, [parkingSpots, toast, user]);

  const mySpot = user?.current_reservation?.spotNumber;
  if (!mySpot) return null;
  if (!isParkedIn(mySpot, parkingSpots)) {
    return null;
  }

  const row = mySpot.slice(0, -1);
  const blockingSpot = parkingSpots.find(
    (s) => s.spotNumber === `${row}B` && !!s.occupiedBy
  );
  if (!blockingSpot || !blockingSpot.occupiedBy) return null;

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
            <div
              className="hidden h-8 w-8 items-center justify-center rounded-full bg-neutral-900
                text-white sm:flex"
            >
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
              {blockingSpot.occupiedBy.estimatedDeparture && (
                <p className="text-xs text-gray-500">
                  Leaving at{" "}
                  {format(
                    new Date(blockingSpot.occupiedBy.estimatedDeparture),
                    "HH:mm"
                  )}
                </p>
              )}
            </div>
          </div>
          {/* Contact and departure time information */}
          <div className="flex items-center gap-2">
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
