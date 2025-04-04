"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detectLicensePlates } from "@/utils/vision";

interface LicensePlateUploadProps {
  onLicensePlatesDetected: (licensePlate: string[]) => void;
}

/*
 * LicensePlateUpload component:
 *
 * Provides a user interface for uploading an image
 * containing a license plate. It sends the image to the recognition API, and
 * calls the onLicensePlateDetected callback with the detected license plate number.
 */
const LicensePlateUpload: React.FC<LicensePlateUploadProps> = ({
  onLicensePlatesDetected,
}) => {
  // State variabels using the useState hook
  const [image, setImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles changes to the image input field
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  /**
   * Handles the submission of the uploaded image to the API.
   */
  const handleSubmit = async () => {
    if (!image) {
      setError("Please select an image.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const platesFromOpenCV = await detectLicensePlates(formData);

      if (platesFromOpenCV.length > 0) {
        onLicensePlatesDetected(platesFromOpenCV);
        return;
      }

      // Sends the image to the API
      const fallbackResponse = await axios.post(
        "http://localhost:8080/license-plate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      const fallbackPlates = fallbackResponse.data.license_plates || [];
      if (fallbackPlates.length > 0) {
        onLicensePlatesDetected(fallbackPlates);
      } else {
        setError("No license plate detected in either systems.");
      }
    } catch (err: any) {
      // Handles errors during the API request
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to detect license plate."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="py-2">
      <Label htmlFor="image-upload">Upload License Plate Image</Label>
      <Input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
      />
      {previewURL && <img src={previewURL} alt="Preview" className="mt-4" />}
      <Button
        onClick={handleSubmit}
        disabled={loading || !image}
        className="mt-4"
      >
        {loading ? "Detecting..." : "Detect License Plate"}
      </Button>

      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default LicensePlateUpload;
