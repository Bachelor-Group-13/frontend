import axios from "axios";

export const visionApi = axios.create({
  baseURL: "http://localhost:8080",
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
