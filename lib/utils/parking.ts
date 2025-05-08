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

const PARKING_ROWS = 5;

export function matchLicensePlates(
  plates: PlateDto[],
  vehicles: Vehicle[]
): Vehicle[] {
  const out: Vehicle[] = vehicles.map((v) => ({ ...v, licensePlate: null }));
  plates.forEach(({ text, bbox }) => {
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

function createParkingSpot(
  spotNumber: string,
  vehicle: Vehicle | null
): DetectedSpot {
  return {
    spotNumber,
    isOccupied: !!vehicle,
    vehicle,
  };
}

function calculateParkingSummary(mappedSpots: DetectedSpot[]) {
  const occupied = mappedSpots.filter((spot) => spot.isOccupied).length;
  const withPlates = mappedSpots.filter(
    (spot) => !!spot.vehicle?.licensePlate
  ).length;

  return {
    totalSpots: PARKING_ROWS * 2,
    occupiedSpots: occupied,
    availableSpots: PARKING_ROWS * 2 - occupied,
    spotsWithPlates: withPlates,
  };
}

export function analyzeParkingData({ vehicles }: { vehicles: Vehicle[] }) {
  const sorted = [...vehicles].sort((a, b) => b.center[0] - a.center[0]);
  const fronts = sorted.filter((v) => v.position === "front");
  const backs = sorted.filter((v) => v.position === "back");

  const mappedSpots: DetectedSpot[] = [];
  for (let i = 0; i < PARKING_ROWS; i++) {
    mappedSpots.push(createParkingSpot(`${i + 1}A`, backs[i]));
    mappedSpots.push(createParkingSpot(`${i + 1}B`, fronts[i]));
  }

  console.log(
    "Occupied spots:",
    mappedSpots.filter((s) => s.isOccupied).length
  );

  return {
    mappedSpots,
    summary: calculateParkingSummary(mappedSpots),
  };
}

export async function detectParkingSpots(imageFile: File) {
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
