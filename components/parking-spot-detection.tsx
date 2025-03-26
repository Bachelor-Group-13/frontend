import { ParkingSpotBoundary } from "@/lib/types";
import { useState } from "react";

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
    } catch (error) {}
  };
}
