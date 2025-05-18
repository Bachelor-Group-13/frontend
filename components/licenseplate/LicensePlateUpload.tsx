"use client";

import { ChangeEvent, FC, useRef, useState, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { detectLicensePlates } from "@/lib/api/vision";
import { uploadLicensePlateImage } from "@/lib/api/api";
import { cn } from "@/lib/utils/utils";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import axios from "axios";

/**
 * Props for the LicensePlateUpload component.
 * @param onLicensePlatesDetected - Callback function that receives an array of detected license plate numbers
 */
interface LicensePlateUploadProps {
  onLicensePlatesDetected: (licensePlate: string[]) => void;
}

/**
 * A component that provides an interface for uploading and processing license plate images.
 *
 * Features:
 * - Drag and drop or click to upload images
 * - Image preview with the ability to remove selected images
 * - File type and size validation
 * - License plate detection
 * - Loading states and error handling
 */
const LicensePlateUpload: FC<LicensePlateUploadProps> = ({
  onLicensePlatesDetected,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handles changes to the image input field
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Processes the selected file and sets the image state
  const processSelectedFile = (file: File) => {
    if (!file.type.match("image.*")) {
      setError("Please select a valid image file.");
      return;
    }

    // Check size (limit 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds the limit of 10MB.");
      return;
    }

    setImage(file);
    setPreviewURL(URL.createObjectURL(file));
    setError(null);
  };

  // Handles drag events for the image input field
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handles the drop event for the image input field
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // File input click handler
  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  // Clears selected image
  const clearImage = () => {
    setImage(null);
    setPreviewURL(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Handles the submission of the uploaded image to the API
  const handleSubmit = async () => {
    if (!image) {
      setError("Please select an image.");
      return;
    }

    setLoading(true);
    setError(null);

    const platesFromAzure = await detectLicensePlates(image);
    console.log("Plates from Azure:", platesFromAzure);

    if (platesFromAzure.length > 0) {
      const texts = platesFromAzure.map((plate) => plate.text);
      onLicensePlatesDetected(texts);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const fallbackResponse = await uploadLicensePlateImage(formData);
      const fallbackPlates = fallbackResponse.data.license_plates || [];
      if (fallbackPlates.length > 0) {
        onLicensePlatesDetected(fallbackPlates);
      } else {
        setError("No license plate detected in either systems.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);

      } else if (err instanceof Error) {
        setError(err.message);

      } else {
        setError(String(err) || "Failed to detect license plate.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={cn(
          `relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-6 transition-colors`,
          dragActive
            ? "border-neutral-900 bg-neutral-50"
            : "border-gray-300 hover:bg-gray-50",
          previewURL ? "bg-white" : "bg-gray-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!previewURL ? handleButtonClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageChange}
          disabled={loading}
          className="hidden"
        />
        {previewURL ? (
          <div className="relative w-full">
            {/* Remove image button */}
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
              <X className="h-4 w-4" />
            </Button>
            {/* Image preview */}
            <img
              src={previewURL || "/placeholder.svg"}
              alt="License plate preview"
              className="mx-auto max-h-[300px] rounded-md object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            {/* Upload icon */}
            <div className="rounded-full bg-gray-100 p-3">
              <Upload className="h-6 w-6 text-gray-500" />
            </div>
            {/* Upload instructions */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Drag and drop an image, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports JPG, PNG, WEBP (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertDescription className="flex items-center gap-2">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Action buttons */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading || !image}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" />
              Detect License Plate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default LicensePlateUpload;
