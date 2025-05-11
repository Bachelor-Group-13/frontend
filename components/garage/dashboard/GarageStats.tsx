import { ParkingSpot } from "@/lib/utils/types";

/**
 * Props for the GarageStats component.
 * @param parkingSpots - List of all parking spots in the garage
 */
interface GarageStatsProps {
  parkingSpots: ParkingSpot[];
}

/**
 * A component that displays the garage's current status.
 *
 * Shows the number of available and occupied parking spots.
 * @param {GarageStatsProps} props - The props for the GarageStats component
 */
export function GarageStats({ parkingSpots }: GarageStatsProps) {
  // Calculate number of available and occupied spots
  const availableSpots = parkingSpots.filter((spot) => !spot.isOccupied).length;
  const occupiedSpots = parkingSpots.filter((spot) => spot.isOccupied).length;

  return (
    <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
      {/* Component header */}
      <h3 className="mb-3 text-lg font-semibold">Garage Status</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Available spots counter */}
        <div className="rounded-md bg-green-50 p-3 text-center">
          <p className="text-sm text-gray-600">Available Spots</p>
          <p className="text-2xl font-bold text-green-600">{availableSpots}</p>
        </div>
        {/* Occupied spots counter */}
        <div className="rounded-md bg-red-50 p-3 text-center">
          <p className="text-sm text-gray-600">Occupied Spots</p>
          <p className="text-2xl font-bold text-red-600">{occupiedSpots}</p>
        </div>
      </div>
    </div>
  );
}
