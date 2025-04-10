import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_VISION_API_URL;

export const visionApi = axios.create({
  baseURL: API_URL,
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

export const detectLicensePlates = async (formData: FormData) => {
  const response = await visionApi.post("/license-plate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.license_plates || [];
};
