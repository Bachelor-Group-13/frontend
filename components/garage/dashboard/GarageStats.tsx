import { ParkingSpot } from "@/lib/utils/types";

interface GarageStatsProps {
  parkingSpots: ParkingSpot[];
}

export function GarageStats({ parkingSpots }: GarageStatsProps) {
  const availableSpots = parkingSpots.filter((spot) => !spot.isOccupied).length;
  const occupiedSpots = parkingSpots.filter((spot) => spot.isOccupied).length;

  return (
    <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold">Garage Status</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md bg-green-50 p-3 text-center">
          <p className="text-sm text-gray-600">Available Spots</p>
          <p className="text-2xl font-bold text-green-600">{availableSpots}</p>
        </div>
        <div className="rounded-md bg-red-50 p-3 text-center">
          <p className="text-sm text-gray-600">Occupied Spots</p>
          <p className="text-2xl font-bold text-red-600">{occupiedSpots}</p>
        </div>
      </div>
    </div>
  );
}
