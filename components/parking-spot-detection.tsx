import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { ParkingSpotBoundary } from "@/lib/types";
import { detectParkingSpots } from "@/utils/vision";

interface ParkingDetectionProps {
  onSpotsDetected?: (spots: ParkingSpotBoundary[]) => void;
}

export function ParkingSpotDetection({
  onSpotsDetected,
}: ParkingDetectionProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

  const detectVehicles = async () => {
    if (!selectedImage) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await detectParkingSpots(selectedImage);

      const vehicles = data.vehicles || [];
      const spots = vehicles.map(
        (vehicle: any, index: number): ParkingSpotBoundary => ({
          id: index,
          spotNumber: `Detected-${index + 1}`,
          boundingBox: vehicle.boundingBox,
        })
      );
      setProcessedImage(data.processedImage || null);
      onSpotsDetected?.(data.spots || []);
    } catch (error) {
      console.error("Error detecting vehicles:", error);
      setError("Failed to detect vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <Label htmlFor="parking-image-upload">Upload Parking Image</Label>
      <Input
        type="file"
        id="parking-image-upload"
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
      />

      <Button
        onClick={detectVehicles}
        disabled={loading || !selectedImage}
        className="w-full"
      >
        {loading ? "Detecting..." : "Detect Vehicles"}
      </Button>

      {error && <p className="mt-2 text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {imagePreview && !processedImage && (
          <div className="mb-2 font-medium">
            <h3>Original Image</h3>
            <img
              src={imagePreview}
              alt="Preview"
              className="h-auto w-full rounded-md"
            />
          </div>
        )}

        {processedImage && (
          <div>
            <h3 className="mb-2 font-medium">Processed Image</h3>
            <img
              src={processedImage}
              alt="Processed"
              className="h-auto w-full rounded-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}
