"use client";
import { ParkingSpotDetection } from "@/components/parking-spot-detection";
import { ParkingSpotBoundary } from "@/lib/types";
import { useState } from "react";

export default function ParkingDetectionPage() {
  const [detectedSpots, setDetectedSpots] = useState<ParkingSpotBoundary[]>([]);

  const handleParkingSpotsDetected = (parkingSpots: ParkingSpotBoundary[]) => {
    setDetectedSpots(parkingSpots);
    console.log("Detected parking spots:", parkingSpots);
  };

  return (
    <div className="container mc-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Parking Spot Detection</h1>
      <ParkingSpotDetection
        onParkingSpotsDetected={handleParkingSpotsDetected}
      />
      {detectedSpots.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Detected Parking Spots</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {detectedSpots.map((spot) => (
              <div key={spot.id} className="p-4 border rounded-md bg-gray-50">
                <p className="font-bold text-lg">{spot.spotNumber}</p>
                <p className="text-sm text-gray-600">
                  Position: [{spot.boundingBox.join(", ")}]
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
