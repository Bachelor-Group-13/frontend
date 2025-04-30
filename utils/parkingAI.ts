import {
  detectParkingSpots as visionDetectParkingSpots,
  detectLicensePlates,
} from "./vision";
import {
  analyzeParkingData,
  matchLicensePlates,
  integrateWithDatabaseData,
} from "./gemini";
import { ParkingSpot, ParkingSpotBoundary } from "./types";

export async function detectParkingSpotsWithAI(imageFile: File) {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const detectionData = await visionDetectParkingSpots(imageFile);
    console.log("Raw detection data:", detectionData);

    const licensePlates = await detectLicensePlates(imageFile);
    console.log("Detected license plates:", licensePlates);

    const analyzedData = await analyzeParkingData(detectionData);
    console.log("Gemini analyzed data:", analyzedData);

    if (analyzedData && analyzedData.mappedSpots) {
      analyzedData.mappedSpots = analyzedData.mappedSpots.map((spot: any) => ({
        ...spot,
        isOccupied: spot.isOccupied === null ? false : spot.isOccupied,
      }));
    }

    let enhancedData = analyzedData;
    if (licensePlates.length > 0) {
      const vehiclesWithPlates = await matchLicensePlates(
        licensePlates,
        detectionData.vehicles
      );

      enhancedData = {
        ...analyzedData,
        vehicles: vehiclesWithPlates,
      };
    }

    return {
      ...enhancedData,
      processedImage: detectionData.processedImage,
      rawDetection: detectionData,
    };
  } catch (error) {
    console.error("Error detecting parking spots with AI:", error);
    throw error;
  }
}

export async function updateParkingSpotsWithAI(
  existingSpots: ParkingSpot[],
  detectionResults: any
) {
  try {
    const updatedSpots = await integrateWithDatabaseData(
      detectionResults,
      existingSpots
    );

    return updatedSpots;
  } catch (error) {
    console.error("Error updating parking spots with AI:", error);
    return existingSpots;
  }
}

export function convertToParkingSpotBoundaries(
  detectionResults: any
): ParkingSpotBoundary[] {
  if (!detectionResults || !detectionResults.mappedSpots) {
    return [];
  }

  return detectionResults.mappedSpots.map(
    (spot: any, index: number): ParkingSpotBoundary => ({
      id: index,
      spotNumber: spot.spotNumber,
      boundingBox: spot.vehicle?.boundingBox || [0, 0, 0, 0],
      isOccupied: spot.isOccupied,
      vehicle: spot.vehicle,
    })
  );
}
