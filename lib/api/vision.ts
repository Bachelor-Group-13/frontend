import axios from "axios";
import { PlateDto } from "../utils/types";

const OPENCV_URL = process.env.NEXT_PUBLIC_VISION_API_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Axios instance configured for vision API requests.
 * Uses the OpenCV URL for parking spot detection.
 */
export const visionApi = axios.create({
  baseURL: OPENCV_URL,
});

/**
 * Axios instance configured for Azure API requests.
 * Uses the AzureCV URL for license plate detection.
 */
export const baseUrl = axios.create({
  baseURL: `${API_URL}`,
});

/**
 * Detects parking spots in an uploaded image.
 * @param file - The image file to analyze
 * @returns Promise with detected parking spots data
 */
export const detectParkingSpots = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await visionApi.post("/parking-detection", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Detects license plates in an uploaded image using Azure's computer vision.
 * @param file - The image file to analyze
 * @returns Promise with array of detected license plates
 */
export const detectLicensePlates = async (file: File): Promise<PlateDto[]> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await baseUrl.post("/license-plate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    return response.data.license_plates || [];
  } catch (err) {
    console.error("License plate detection failed:", err);
    return [];
  }
};
