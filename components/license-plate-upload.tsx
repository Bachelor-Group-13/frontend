"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LicensePlateUploadProps {
  onLicensePlateDetected: (licensePlate: string) => void;
}

/*
 * LicensePlateUpload component:
 *
 * Provides a user interface for uploading an image
 * containing a license plate. It sends the image to the recognition API, and
 * calls the onLicensePlateDetected callback with the detected license plate number.
 */
const LicensePlateUpload: React.FC<LicensePlateUploadProps> = ({
  onLicensePlateDetected,
}) => {
  // State variabels using the useState hook
  const [image, setImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * handleImageChange function:
   *
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
   * handleSubmit function:
   *
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
      // Sends the image to the API
      const response = await axios.post(
        "http://localhost:8080/license-plate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        },
      );

      if (response.data && response.data.license_plate) {
        onLicensePlateDetected(response.data.license_plate);
      } else {
        setError("License plate not found.");
      }
    } catch (err: any) {
      // Handles errors during the API request
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to detect license plate.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Label htmlFor="image-upload">Upload License Plate Image</Label>
      <Input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
      />
      {previewURL && (
        <img
          src={previewURL}
          alt="Preview"
          style={{ maxWidth: "200px", marginTop: "10px" }}
        />
      )}
      <Button
        onClick={handleSubmit}
        disabled={loading || !image}
        className="mt-4"
      >
        {loading ? "Detecting..." : "Detect License Plate"}
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default LicensePlateUpload;
