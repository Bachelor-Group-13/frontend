import { Card, CardContent } from "@/components/ui/card";
import { ParkingSpot } from "@/lib/utils/types";
import { ParkingStatus } from "./dashboard/ParkingStatus";
import { GarageStats } from "./dashboard/GarageStats";
import { NearbyVehicles } from "./dashboard/NearbyVehicles";
import { ParkedInBy } from "./dashboard/ParkedInBy";

interface GarageDashboardProps {
  user: any;
  parkingSpots: ParkingSpot[];
}

export function GarageDashboard({ user, parkingSpots }: GarageDashboardProps) {
  return (
    <Card className="border-0 bg-gray-50 shadow-none">
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Parking Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Parking Status</h2>
            <ParkingStatus user={user} parkingSpots={parkingSpots} />
            <GarageStats parkingSpots={parkingSpots} />
          </div>

          {/* Nearby Vehicles */}
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
