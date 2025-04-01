import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";

interface Vehicle {
  type: string;
  confidence: number;
  boudingBox: number[];
  canter: number[];
  area: number;
  position: "front" | "back";
}

interface ParkingDetectionProps {
  onVehiclesDetected?: (vehicles: Vehicle[]) => void;
}

export function ParkingSpotDetection({
  onVehiclesDetected,
}: ParkingDetectionProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<{
    totalVehicles: number;
    frontVehicles: number;
    backVehicles: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setProcessedImage(null);
      setVehicles([]);
      setStats(null);
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

    /*     try { */
    const formData = new FormData();
    formData.append("file", selectedImage);

    axios
      .post("http://localhost:8000/parking-detection", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setVehicles(response.data.vehicles || []);
        setProcessedImage(response.data.processed_image || null);
        setStats({
          totalVehicles: response.data.total_vehicles,
          frontVehicles: response.data.front_vehicles,
          backVehicles: response.data.back_vehicles,
        });

        if (onVehiclesDetected) {
          onVehiclesDetected(response.data.vehicles);
        }
      })
      .catch((e) => {
        alert("Error");
        console.error(e);
      });

    //   const data = response.data();
    //   setVehicles(data.vehicles || []);
    //   setProcessedImage(data.processed_image || null);
    //   setStats({
    //     totalVehicles: data.total_vehicles,
    //     frontVehicles: data.front_vehicles,
    //     backVehicles: data.back_vehicles,
    //   });
    //
    //   if (onVehiclesDetected) {
    //     onVehiclesDetected(data.vehicles);
    //   }
    // } catch (error: any) {
    //   setError(
    //     `Failed to detect parking spots: ${
    //       error.response?.data?.detail || error.message
    //     }`,
    //   );
    // } finally {
    //   setLoading(false);
    // }
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

        {stats && (
          <div className="rounded-md bg-gray-50 p-4">
            <h3 className="mb-4 font-medium">Detection Results</h3>

            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-sm text-gray-500">Total Vehicles</p>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
              </div>
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-sm text-gray-500">Front</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.frontVehicles}
                </p>
              </div>
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-sm text-gray-500">Back</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.backVehicles}
                </p>
              </div>
            </div>

            {vehicles.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Detected Vehicles</h4>
                <div className="max-h-60 overflow-y-auto">
                  {vehicles.map((vehicle, index) => (
                    <div
                      key={index}
                      className="mb-2 rounded-md bg-white p-2 shadow-sm"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{vehicle.type}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                          vehicle.position === "front"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {vehicle.position}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Confidence: {(vehicle.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
