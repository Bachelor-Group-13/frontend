import {
  PlateDto,
  Vehicle,
  DetectedSpot,
  ParkingSpotBoundary,
  ParkingSpot,
} from "./types";
import {
  detectLicensePlates,
  detectParkingSpots as visionDetectParkingSpots,
} from "../api/vision";

export function matchLicensePlates(
  plates: PlateDto[],
  vehicles: Vehicle[]
): Vehicle[] {
  const out: Vehicle[] = vehicles.map((v) => ({ ...v, licensePlate: null }));
  plates.forEach(({ text, bbox }) => {
    // pick [x1,y1,x2,y2]
    const [x1, y1, x2, y2] =
      bbox.length === 4
        ? (bbox as [number, number, number, number])
        : [bbox[0], bbox[1], bbox[4], bbox[5]];
    const px = (x1 + x2) / 2,
      py = (y1 + y2) / 2;
    let best: Vehicle | null = null;
    let bestDist = Infinity;
    out.forEach((v) => {
      const dx = v.center[0] - px,
        dy = v.center[1] - py,
        d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        best = v;
      }
    });
    if (best) {
      (best as Vehicle).licensePlate = text;
    }
  });
  return out;
}

export function analyzeParkingData({ vehicles }: { vehicles: Vehicle[] }) {
  const sorted = [...vehicles].sort((a, b) => b.center[0] - a.center[0]);
  const fronts = sorted.filter((v) => v.position === "front");
  const backs = sorted.filter((v) => v.position === "back");
  const mappedSpots: DetectedSpot[] = [];
  for (let i = 0; i < 5; i++) {
    mappedSpots.push({
      spotNumber: `${i + 1}A`,
      isOccupied: !!backs[i],
      vehicle: backs[i] || null,
    });
    mappedSpots.push({
      spotNumber: `${i + 1}B`,
      isOccupied: !!fronts[i],
      vehicle: fronts[i] || null,
    });
  }
  const occupied = mappedSpots.filter((s) => s.isOccupied).length;
  const withPlates = mappedSpots.filter(
    (s) => !!s.vehicle?.licensePlate
  ).length;

  console.log("Occupied spots:", occupied);
  return {
    mappedSpots,
    summary: {
      totalSpots: 10,
      occupiedSpots: occupied,
      availableSpots: 10 - occupied,
      spotsWithPlates: withPlates,
    },
  };
}

export async function detectParkingSpotsWithAI(imageFile: File) {
  const detection = await visionDetectParkingSpots(imageFile);
  const plates = await detectLicensePlates(imageFile);
  const vehicles1 = matchLicensePlates(plates, detection.vehicles);
  const { mappedSpots, summary } = analyzeParkingData({ vehicles: vehicles1 });

  console.log("Raw detection data:", detection);
  console.log("Detected license plates:", plates);
  console.log("Mapped parking spots:", mappedSpots);
  console.log("Summary of parking spots:", summary);

  return {
    mappedSpots,
    summary,
    vehicles: vehicles1,
    processedImage: detection.processedImage,
    rawDetection: detection,
  };
}

export function convertToParkingSpotBoundaries(detectionResults: {
  mappedSpots: DetectedSpot[];
  rawDetection?: { vehicles: Vehicle[]; prcessedImage?: string };
}): ParkingSpotBoundary[] {
  return detectionResults.mappedSpots.map((spot, index) => ({
    id: index,
    spotNumber: spot.spotNumber,
    boundingBox: spot.vehicle?.boundingBox ?? [0, 0, 0, 0],
    isOccupied: spot.isOccupied,
    vehicle: spot.vehicle ?? null,
  }));
}

export const isParkedIn = (
  spotNumber: string,
  spots: ParkingSpot[]
): boolean => {
  const spotLetter = spotNumber.slice(-1);

  if (spotLetter !== "A") {
    return false;
  }

  const rowNumber = spotNumber.slice(0, -1);
  const correspondingBSpot = `${rowNumber}B`;

  const bSpot = spots.find((spot) => spot.spotNumber === correspondingBSpot);

  return bSpot ? bSpot.isOccupied : false;
};

export const isBlockingCar = (
  mySpotNumber: string,
  otherSpotNumber: string
) => {
  if (!mySpotNumber.endsWith("A")) return false;
  const row = mySpotNumber.slice(0, -1);
  return otherSpotNumber === `${row}B`;
};
