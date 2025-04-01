import { ParkingSpot } from "@/lib/types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Mail, MessageCircle, Phone } from "lucide-react";
import CarspotVisuals from "./carspot-visuals";

export function ParkingSpotCard({
  spot,
  onClick,
}: {
  spot: ParkingSpot;
  onClick: () => void;
}) {
  return (
    <HoverCard key={spot.id}>
      <HoverCardTrigger asChild>
        <div
          className={`h-24 flex justify-center items-center text-white
                                  font-bold cursor-pointer rounded ${
                                    spot.isOccupied
                                      ? "bg-red-600"
                                      : "bg-green-600"
                                  }`}
          onClick={onClick}
        >
          <span className="justify-center items-center text-sm font-bold">
            {spot.spotNumber}
          </span>
          <div className="relative w-full h-full md:h-full md:w-full xs:w-full xs:h-full">
            <CarspotVisuals isAvailable={!spot.isOccupied} />
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        {spot.isOccupied && spot.occupiedBy ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">
              License plate: {spot.occupiedBy.license_plate}
            </h4>
            <div
              className="flex justify-between items-center
                            text-sm text-gray-600"
            >
              <p>Email: {spot.occupiedBy.email}</p>
              <a
                href={`mailto:${spot.occupiedBy.email}`}
                className="text-neutral-900 hover:text-blue-700"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div
              className="flex justify-between items-center
                            text-sm text-gray-600"
            >
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
          </div>
        ) : (
          <p className="text-sm text-gray-500">This spot is available.</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
