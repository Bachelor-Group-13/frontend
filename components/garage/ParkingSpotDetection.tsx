import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ParkingSpotBoundary, Vehicle } from "@/lib/utils/types";
import { cn } from "@/lib/utils/utils";
import { Car, AlertCircle, ArrowRight, Loader2, ImageIcon } from "lucide-react";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  convertToParkingSpotBoundaries,
  detectParkingSpots,
} from "@/lib/utils/parking";

interface ParkingDetectionProps {
  onSpotsDetected?: (spots: ParkingSpotBoundary[], vehicles: Vehicle[]) => void;
}

export function ParkingSpotDetection({
  onSpotsDetected,
}: ParkingDetectionProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Process selected file
   */
  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setProcessedImage(null);
    setError(null);
  };

  /**
   * Handle file input change event
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  /**
   * Handles drag events
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  /**
   * Handles drop events
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Triggers file input click
   */
  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  /**
   * Clears the selected image
   */
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setProcessedImage(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  /**
   * Detects vehicles in the selected image
   */
  const detectVehicles = async () => {
    if (!selectedImage) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 5;
        return newProgress < 90 ? newProgress : prev;
      });
    }, 200);

    try {
      const { mappedSpots, vehicles, processedImage, rawDetection } =
        await detectParkingSpots(selectedImage);

      clearInterval(progressInterval);
      setProgress(100);
      setProcessedImage(processedImage);

      const boundaries = convertToParkingSpotBoundaries({
        mappedSpots,
        rawDetection,
      });
      onSpotsDetected?.(boundaries, vehicles);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error detecting vehicles:", error);
      setError("Failed to detect vehicles. Please try again.");
      setProgress(0);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          `relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-6 transition-colors`,
          dragActive
            ? "border-neutral-900 bg-neutral-50"
            : "border-gray-300 hover:bg-gray-50",
          imagePreview && !processedImage ? "bg-white" : "bg-gray-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!imagePreview ? handleButtonClick : undefined}
      >
        <Input
          ref={inputRef}
          type="file"
          id="parking-image-upload"
          accept="image/*"
          onChange={handleImageChange}
          disabled={loading}
          className="hidden"
        />

        {imagePreview && !processedImage ? (
          <div className="relative w-full">
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm
                hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Parking Area Preview"
              className="mx-auto max-h-[300px] rounded-md object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Car className="h-6 w-6 text-gray-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Drag and drop a parking area image, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports JPG, PNG, WEBP (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Processing image...
            </p>
            <p className="text-sm text-gray-500">{progress}%</p>
          </div>
          <Progress value={progress} className="h-2 w-full" />
        </div>
      )}
      <div className="flex justify-end">
        <Button
          onClick={detectVehicles}
          disabled={loading || !selectedImage}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Detecting Vehicles...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" />
              Detect Parking Spots
            </>
          )}
        </Button>
      </div>

      {processedImage && (
        <div className="mt-8 space-y-4 rounded-lg border bg-gray-50 p-4">
          <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
            <Car className="h-5 w-5 text-neutral-700" />
            Detection Results
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Original Image
                </h4>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
              <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Original parking area"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Processed Image
                </h4>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Spots Detected
                </span>
              </div>
              <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                <img
                  src={processedImage || "/placeholder.svg"}
                  alt="Processed parking area with detected spots"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
