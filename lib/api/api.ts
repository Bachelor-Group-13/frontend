import { api } from "./auth";

/**
 * Uploads an image for license plate recognition.
 * @param formData - FormData containing the image file
 * @returns Promise with recognition results
 */
export const uploadLicensePlateImage = (formData: FormData) =>
  api.post("/license-plate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
