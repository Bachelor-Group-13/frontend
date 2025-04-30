import { GoogleGenAI } from "@google/genai";

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
      const prompt = `
Analyze this parking detection data from YOLOv8:
${JSON.stringify(detectionData, null, 2)}

The data contains vehicle detections with positions marked as "front" or "back".
In our parking garage, spots are arranged in rows with A and B positions.
- "back" vehicles are likely parked in A spots (closer to wall)
- "front" vehicles are likely parked in B spots (further from wall/closer to entrance)

Return a JSON object with:
1. "mappedSpots": Array of parking spots with:
   - spotNumber (string, format: "1A", "1B", "2A", "2B", etc.)
   - isOccupied (boolean)
   - vehicle (object with vehicle details if occupied, null if not)
2. "summary": Object with:
   - totalSpots (number, should be 10 for our garage)
   - occupiedSpots (number)
   - availableSpots (number)

For mapping vehicles to spots:
- Assign "front" vehicles to A spots (1A, 2A, etc.)
- Assign "back" vehicles to B spots (1B, 2B, etc.)
- Use vehicle positions and areas to determine the most likely spot assignment
- Our garage has 5 rows with 2 spots each (A and B), for a total of 10 spots
`;

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

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
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
  vehicleData: any
) {
  try {
    if (!licensePlates.length || !vehicleData || !vehicleData.length) {
      return vehicleData;
    }

    const prompt = `
Match these detected license plates to vehicles:

License plates: ${JSON.stringify(licensePlates)}
Vehicle data: ${JSON.stringify(vehicleData, null, 2)}

Return a JSON object with the same structure as the vehicle data, but add a "licensePlate" field
to each vehicle with the most likely license plate match. If no match is likely, set it to null.

Use these rules for matching:
1. Front vehicles are more likely to have visible license plates
2. If there are fewer license plates than vehicles, assign plates to the most confident detections first
3. If there are more license plates than vehicles, only use the most confident license plate detections
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
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
    console.error("Error matching license plates with Gemini:", error);

    return vehicleData.map((vehicle: any, index: number) => {
      return {
        ...vehicle,
        licensePlate:
          index < licensePlates.length ? licensePlates[index] : null,
      };
    });
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
      model: "gemini-2.0-flash-lite",
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
      model: "gemini-2.0-flash-lite",
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

    return {
      spotNumber,
      isOccupied: false,
      vehicle: null,
    };
  });

  if (detectionData.vehicles && detectionData.vehicles.length > 0) {
    const sortedVehicles = [...detectionData.vehicles].sort(
      (a, b) => (b.confidence || 0) - (a.confidence || 0)
    );

    sortedVehicles.forEach((vehicle) => {
      const position = vehicle.position || "front";
      const preferredCol = position === "front" ? "B" : "A";

      const emptySpot = mappedSpots.find(
        (spot) => !spot.isOccupied && spot.spotNumber.endsWith(preferredCol)
      );

      if (emptySpot) {
        emptySpot.isOccupied = true;
        emptySpot.vehicle = vehicle;
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

    return {
      ...spot,
      isOccupied: aiSpot.isOccupied,
      detectedVehicle: aiSpot.vehicle
        ? {
            ...aiSpot.vehicle,
            confidence: aiSpot.vehicle.confidence || 0,
            licensePlate: aiSpot.vehicle.licensePlate || null,
          }
        : null,
    };
  });
}

export default {
  analyzeParkingData,
  matchLicensePlates,
  integrateWithDatabaseData,
  enhanceVehicleDetection,
};
