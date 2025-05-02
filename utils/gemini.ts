import { GoogleGenAI } from "@google/genai";
import { Vehicle } from "./types";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

const PARKING_SYSTEM_INSTRUCTION = `You are ParkingAI, a specialized AI assistant for parking garage management systems.
Your primary functions are:
1. Analyze parking detection data from computer vision systems
2. Map detected vehicles to specific parking spots
3. Match license plates to vehicles
4. Integrate AI detections with database records

Always return valid JSON without explanations or markdown formatting.
Be precise in your analysis and focus on providing structured data that can be directly used by the application.`;

/**
 * Helper function to extract text from various response formats
 */
function extractTextFromResponse(response: any): string | null {
  // Handle streaming response
  if (response?.text) {
    return typeof response.text === "function"
      ? response.text()
      : response.text;
  }

  if (response?.response?.text) {
    return typeof response.response.text === "function"
      ? response.response.text()
      : response.response.text;
  }

  // Handle candidates format
  if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }

  console.error(
    "Unexpected response structure:",
    JSON.stringify(response, null, 2)
  );
  return null;
}

/**
 * Parse JSON from text, handling potential markdown code blocks
 */
function parseJsonResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (parseError) {
    const jsonMatch =
      text.match(/```(?:json)?\n([\s\S]*?)\n```/) ||
      text.match(/```([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (nestedError) {
        throw new Error(`Could not parse JSON from response: ${text}`);
      }
    }
    throw new Error(`Could not parse response as JSON: ${text}`);
  }
}

/**
 * Analyze parking detection data and map vehicles to spots
 */
export async function analyzeParkingData(detectionData: any) {
  const maxRetries = 3;
  let retryCount = 0;
  let delay = 1000;

  while (retryCount < maxRetries) {
    try {
      if (!detectionData.vehicles || detectionData.vehicles.length === 0) {
        return {
          mappedSpots: Array.from({ length: 10 }, (_, i) => ({
            spotNumber: `${Math.floor(i / 2) + 1}${i % 2 === 0 ? "A" : "B"}`,
            isOccupied: false,
            vehicle: null,
          })),
          summary: {
            totalSpots: 10,
            occupiedSpots: 0,
            availableSpots: 10,
          },
        };
      }

      // Sort all vehicles by x-coordinate (right to left)
      const vehicles = [...detectionData.vehicles].sort(
        (a, b) => b.center[0] - a.center[0]
      );

      // Create a map of all spots
      const spotsMap = new Map();
      for (let i = 1; i <= 5; i++) {
        spotsMap.set(`${i}A`, {
          spotNumber: `${i}A`,
          isOccupied: false,
          vehicle: null,
        });
        spotsMap.set(`${i}B`, {
          spotNumber: `${i}B`,
          isOccupied: false,
          vehicle: null,
        });
      }

      // First, mark all spots as occupied based on vehicle positions
      vehicles.forEach((vehicle) => {
        const isBack = vehicle.position === "back";
        // Find the first available spot from right to left
        for (let i = 1; i <= 5; i++) {
          const spotNumber = `${i}${isBack ? "A" : "B"}`;
          const spot = spotsMap.get(spotNumber);
          if (!spot.isOccupied) {
            spotsMap.set(spotNumber, {
              spotNumber,
              isOccupied: true,
              vehicle: null, // Initially set all vehicles to null
            });
            break;
          }
        }
      });

      // Then, assign vehicles with license plates to spots
      const frontVehicles = vehicles
        .filter((v) => v.position === "front" && v.licensePlate)
        .sort((a, b) => b.center[0] - a.center[0]);

      const backVehicles = vehicles
        .filter((v) => v.position === "back" && v.licensePlate)
        .sort((a, b) => b.center[0] - a.center[0]);

      // Map front vehicles to B spots first (rightmost to leftmost)
      let frontSpotIndex = 1;
      frontVehicles.forEach((vehicle) => {
        while (frontSpotIndex <= 5) {
          const spotNumber = `${frontSpotIndex}B`;
          const spot = spotsMap.get(spotNumber);
          if (spot.isOccupied && !spot.vehicle) {
            spotsMap.set(spotNumber, {
              ...spot,
              vehicle: vehicle,
            });
            frontSpotIndex++;
            break;
          }
          frontSpotIndex++;
        }
      });

      // Map back vehicles to A spots (rightmost to leftmost)
      let backSpotIndex = 1;
      backVehicles.forEach((vehicle) => {
        while (backSpotIndex <= 5) {
          const spotNumber = `${backSpotIndex}A`;
          const spot = spotsMap.get(spotNumber);
          if (spot.isOccupied && !spot.vehicle) {
            spotsMap.set(spotNumber, {
              ...spot,
              vehicle: vehicle,
            });
            backSpotIndex++;
            break;
          }
          backSpotIndex++;
        }
      });

      // Convert map to array and sort
      const mappedSpots = Array.from(spotsMap.values()).sort((a, b) => {
        const aNum = parseInt(a.spotNumber.replace(/[AB]/, ""));
        const bNum = parseInt(b.spotNumber.replace(/[AB]/, ""));
        if (aNum !== bNum) return aNum - bNum;
        return a.spotNumber.endsWith("A") ? -1 : 1;
      });

      // Only count spots with plates as occupied
      const occupiedSpots = mappedSpots.filter(
        (spot) => spot.isOccupied
      ).length;
      const spotsWithPlates = mappedSpots.filter(
        (spot) => spot.vehicle?.licensePlate
      ).length;

      console.log(
        `Total occupied spots: ${occupiedSpots}, Spots with plates: ${spotsWithPlates}`
      );

      return {
        mappedSpots,
        summary: {
          totalSpots: 10,
          occupiedSpots,
          availableSpots: 10 - occupiedSpots,
          spotsWithPlates,
        },
      };
    } catch (error: any) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      if (error.message?.includes("429") || error.message?.includes("503")) {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error("Max retries reached, falling back to basic analysis");
          return fallbackParkingAnalysis(detectionData);
        }
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        console.error("Error analyzing parking data with Gemini:", error);
        return fallbackParkingAnalysis(detectionData);
      }
    }
  }
  return fallbackParkingAnalysis(detectionData);
}

/**
 * Match detected license plates to vehicles
 */
export async function matchLicensePlates(
  licensePlates: string[],
  vehicleData: Vehicle[]
) {
  try {
    if (!licensePlates.length || !vehicleData || !vehicleData.length) {
      return vehicleData;
    }

    // Create a deep copy of the vehicles array to avoid modifying the original
    const vehicles = JSON.parse(JSON.stringify(vehicleData));

    // Sort vehicles by x-coordinate (right to left)
    const sortedVehicles = vehicles.sort(
      (a: Vehicle, b: Vehicle) => b.center[0] - a.center[0]
    );

    // Create a map to store the original indices
    const originalIndices = new Map();
    vehicles.forEach((v: Vehicle, i: number) => {
      originalIndices.set(v, i);
    });

    // Initialize all vehicles with null license plates
    sortedVehicles.forEach((vehicle: Vehicle) => {
      vehicle.licensePlate = null;
    });

    // Find the rightmost front vehicle (should be in 1B)
    const frontVehicle = sortedVehicles.find(
      (v: Vehicle) => v.position === "front"
    );

    // Find the rightmost back vehicles
    const backVehicles = sortedVehicles
      .filter((v: Vehicle) => v.position === "back")
      .sort((a: Vehicle, b: Vehicle) => b.center[0] - a.center[0]); // Sort right to left

    // Reverse the license plates array to get the correct order
    const reversedPlates = [...licensePlates].reverse();
    let plateIndex = 0;

    // First, assign plate to the front vehicle (1B)
    if (frontVehicle && plateIndex < reversedPlates.length) {
      frontVehicle.licensePlate = reversedPlates[plateIndex];
      console.log(
        `Assigning ${reversedPlates[plateIndex]} to front vehicle (1B)`
      );
      plateIndex++;
    }

    // Then assign remaining plates to back vehicles from right to left
    backVehicles.forEach((vehicle: Vehicle, index: number) => {
      if (plateIndex < reversedPlates.length) {
        vehicle.licensePlate = reversedPlates[plateIndex];
        console.log(
          `Assigning ${reversedPlates[plateIndex]} to back vehicle at position ${index + 1}`
        );
        plateIndex++;
      } else {
        vehicle.licensePlate = null;
        console.log(
          `No plate visible for back vehicle at position ${index + 1}`
        );
      }
    });

    // Restore original order
    return vehicles.sort(
      (a: Vehicle, b: Vehicle) =>
        originalIndices.get(a) - originalIndices.get(b)
    );
  } catch (error) {
    console.error("Error matching license plates:", error);
    return vehicleData;
  }
}

/**
 * Integrate AI-detected parking data with existing database records
 */
export async function integrateWithDatabaseData(
  geminiData: any,
  existingSpots: any[]
) {
  try {
    const prompt = `
Integrate AI-detected parking data with existing database records:

AI-detected data: ${JSON.stringify(geminiData, null, 2)}
Existing database records: ${JSON.stringify(existingSpots, null, 2)}

Return a JSON array of updated parking spots that combines both data sources:
1. Use the spot structure from existing database records
2. Update isOccupied status based on AI detection
3. If AI detected a vehicle with a license plate, add that information to the detectedVehicle field
4. If the license plate matches a user in the database, keep the existing occupiedBy information
5. If there's a conflict (database says occupied but AI says empty or vice versa), prefer the AI detection
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        systemInstruction: PARKING_SYSTEM_INSTRUCTION,
      },
    });

    const text = extractTextFromResponse(response);

    if (!text) {
      throw new Error("Failed to extract text from Gemini API response");
    }

    return parseJsonResponse(text);
  } catch (error) {
    console.error("Error integrating data with Gemini:", error);

    return fallbackIntegration(geminiData, existingSpots);
  }
}

/**
 * Enhance vehicle detection with additional information
 */
export async function enhanceVehicleDetection(vehicleData: any) {
  try {
    const prompt = `
Analyze these detected vehicles and enhance the data:
${JSON.stringify(vehicleData, null, 2)}

For each vehicle, add the following information:
1. "parkingQuality": A string describing how well the vehicle is parked ("good", "poor", "angled")
2. "vehicleType": More specific than just "car" if possible (e.g., "sedan", "SUV", "truck")
3. "parkingSpotSuggestion": The most appropriate spot number for this vehicle

Return the enhanced vehicle data as a JSON array.
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        systemInstruction: PARKING_SYSTEM_INSTRUCTION,
      },
    });

    const text = extractTextFromResponse(response);

    if (!text) {
      throw new Error("Failed to extract text from Gemini API response");
    }

    return parseJsonResponse(text);
  } catch (error) {
    console.error("Error enhancing vehicle detection with Gemini:", error);
    return vehicleData;
  }
}

/**
 * Fallback function for when the AI service is unavailable
 */
function fallbackParkingAnalysis(detectionData: any) {
  console.log("Using fallback parking analysis");

  const mappedSpots = Array.from({ length: 10 }, (_, i) => {
    const row = Math.floor(i / 2) + 1;
    const col = i % 2 === 0 ? "A" : "B";
    const spotNumber = `${row}${col}`;
    return { spotNumber, isOccupied: false, vehicle: null };
  });

  if (detectionData.vehicles && detectionData.vehicles.length > 0) {
    const sortedVehicles = [...detectionData.vehicles].sort(
      (a, b) => (b.center?.[0] || 0) - (a.center?.[0] || 0)
    );

    const backVehicles = sortedVehicles.filter((v) => v.position === "back");
    backVehicles.forEach((vehicle, index) => {
      const spotNumber = `${index + 1}A`;
      const spot = mappedSpots.find((s) => s.spotNumber === spotNumber);
      if (spot) {
        spot.isOccupied = true;
        spot.vehicle = vehicle;
      }
    });

    const frontVehicles = sortedVehicles.filter((v) => v.position === "front");
    frontVehicles.forEach((vehicle, index) => {
      const spotNumber = `${index + 1}B`;
      const spot = mappedSpots.find((s) => s.spotNumber === spotNumber);
      if (spot) {
        spot.isOccupied = true;
        spot.vehicle = vehicle;
      }
    });
  }

  const occupiedSpots = mappedSpots.filter((spot) => spot.isOccupied).length;

  return {
    mappedSpots,
    summary: {
      totalSpots: 10,
      occupiedSpots,
      availableSpots: 10 - occupiedSpots,
    },
  };
}

/**
 * Fallback function for integrating AI data with database records
 */
function fallbackIntegration(geminiData: any, existingSpots: any[]) {
  const aiSpotMap = new Map();
  if (geminiData && geminiData.mappedSpots) {
    geminiData.mappedSpots.forEach((spot: any) => {
      aiSpotMap.set(spot.spotNumber, spot);
    });
  }

  return existingSpots.map((spot) => {
    const aiSpot = aiSpotMap.get(spot.spotNumber);

    if (!aiSpot) {
      return spot;
    }

    // Only include vehicle data if there's a license plate
    const vehicle = aiSpot.vehicle;
    const hasLicensePlate = vehicle?.licensePlate != null;

    return {
      ...spot,
      isOccupied: aiSpot.isOccupied,
      detectedVehicle: hasLicensePlate
        ? {
            ...vehicle,
            confidence: vehicle.confidence || 0,
            licensePlate: vehicle.licensePlate,
          }
        : null,
    };
  });
}

export default {
  analyzeParkingData,
  matchLicensePlates,
  integrateWithDatabaseData: fallbackIntegration,
  enhanceVehicleDetection: (vehicleData: any) => vehicleData,
};
