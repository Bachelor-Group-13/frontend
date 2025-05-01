import axios from "axios";
import { PlateDto } from "./types";
import { api } from "./auth";

const OPENCV_URL = process.env.NEXT_PUBLIC_VISION_API_URL;

export const visionApi = axios.create({
  baseURL: OPENCV_URL,
});

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

export const detectLicensePlates = async (file: File): Promise<PlateDto[]> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/license-plate`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      }
    );
    // const fallback = await visionApi.post(
    //   `${OPENCV_URL}/license-plate`,
    //   formData,
    //   {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //       Accept: "application/json",
    //     },
    //   }
    // );

    return response.data.license_plates || [];
  } catch (err) {
    console.error("License plate detection failed:", err);
    return [];
  }
};
