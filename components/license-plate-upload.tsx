"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LicensePlateUploadProps {
  onLicensePlateDetected: (licensePlate: string) => void;
}

const LicensePlateUpload: React.FC<LicensePlateUploadProps> = ({
  onLicensePlateDetected,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

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
