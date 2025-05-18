import { Card, CardContent } from "@/components/ui/card";
import { ParkingSpot } from "@/lib/utils/types";
import { ParkingStatus } from "./dashboard/ParkingStatus";
import { GarageStats } from "./dashboard/GarageStats";
import { NearbyVehicles } from "./dashboard/NearbyVehicles";
import { ParkedInBy } from "./dashboard/ParkedInBy";

/**
 * Props for the GarageDashboard component.
 * @param user - The current user data
 * @param parkingSpots - The list of parking spots in the garage
 */
interface GarageDashboardProps {
  user: unknown;
  parkingSpots: ParkingSpot[];
}

/**
 * A component that displays the main dashboard for the garage.
 *
 * Shows parking status, garage stats, and nearby vehicles.
 * @param {GarageDashboardProps} props - The props for the GarageDashboard component
 */
export function GarageDashboard({ user, parkingSpots }: GarageDashboardProps) {
  return (
    <Card className="w-full border-0 bg-gray-50 shadow-none">
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column: Parking status and stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Parking Status</h2>
            <ParkingStatus user={user} parkingSpots={parkingSpots} />
            <GarageStats parkingSpots={parkingSpots} />
          </div>

          {/* Right column: Nearby vehicles and parked in by */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Nearby Vehicles</h2>
            <ParkedInBy user={user} parkingSpots={parkingSpots} />
            <NearbyVehicles user={user} parkingSpots={parkingSpots} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
