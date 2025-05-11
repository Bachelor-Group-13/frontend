import { Card, CardContent } from "@/components/ui/card";
import { ParkingSpot } from "@/lib/utils/types";
import { ParkingSpotCard } from "./ParkingSpotCard";

interface GarageMapProps {
  parkingSpots: ParkingSpot[];
  onSpotSelect: (spot: ParkingSpot) => void;
  currentUserId: string | null;
}

export function GarageMap({
  parkingSpots,
  onSpotSelect,
  currentUserId,
}: GarageMapProps) {
  return (
    <Card className="border-0 bg-gray-50 shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 grid grid-cols-2 gap-4 md:col-span-6">
            {parkingSpots.map((spot) => (
              <ParkingSpotCard
                key={spot.id}
                spot={spot}
                onClick={() => onSpotSelect(spot)}
                currentUserId={currentUserId}
              />
            ))}
          </div>

          {/* Driving lane */}
          <div className="hidden items-center justify-center rounded-lg bg-gray-200 md:col-span-2 md:flex">
            <p className="rotate-90 whitespace-nowrap font-bold text-gray-600">
              DRIVING LANE
            </p>
          </div>

          {/* Stairs / Entrance */}
          <div className="ml-7 hidden items-center justify-center md:col-span-4 md:flex">
            <div
              className="flex h-40 w-full items-center justify-center rounded-lg bg-gray-800 font-bold
                text-white"
            >
              STAIRS / ENTRANCE
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 rounded-lg bg-white p-4 text-sm">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-orange-500"></div>
            <span>Your Spot</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-red-500"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-gray-500"></div>
            <span>Unknown Vehicle</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
