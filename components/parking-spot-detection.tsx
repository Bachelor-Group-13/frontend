import { ParkingSpotBoundary } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface ParkingSpotDetectionProps {
  onParkingSpotsDetected?: (parkingSpots: ParkingSpotBoundary[]) => void;
}

export function ParkingSpotDetection({
  onParkingSpotsDetected,
}: ParkingSpotDetectionProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotBoundary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setParkingSpots([]);
      setError(null);
    }
  };

  const detectParkingSpots = async () => {
    if (!selectedImage) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      const response = await fetch("http://localhost:8080/parking-spots", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const spots = data.parkingSpots || [];
      setParkingSpots(spots);
      if (onParkingSpotsDetected) {
        onParkingSpotsDetected(spots);
      }
    } catch (error: any) {
      setError(`Failed to detect parking spots: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !imagePreview || parkingSpots.length === 0)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      parkingSpots.forEach((spot) => {
        const [x, y, width, height] = spot.boundingBox;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "white";
        ctx.fillRect(x, y - 20, 30, 20);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(spot.spotNumber, x + 5, y - 5);
      });
    };
    img.src = imagePreview;
  }, [imagePreview, parkingSpots]);

  return (
    <div className="py-2">
      <Label htmlFor="parking-image-upload">Upload Parking Image</Label>
      <Input
        type="file"
        id="parking-image-upload"
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
      />

      {imagePreview && (
        <div className="mt-4 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-auto"
            style={{ display: parkingSpots.length > 0 ? "none" : "block" }}
          />
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ display: parkingSpots.length > 0 ? "block" : "none" }}
          />
        </div>
      )}

      <Button
        onClick={detectParkingSpots}
        disabled={loading || !selectedImage}
        className="mt-4"
      >
        {loading ? "Detecting..." : "Detect Parking Spots"}
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
