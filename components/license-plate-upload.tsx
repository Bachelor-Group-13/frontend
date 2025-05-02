"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { detectLicensePlates } from "@/utils/vision";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

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
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles changes to the image input field
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  /**
   * Processes the selected file and sets the image state.
   */
  const processSelectedFile = (file: File) => {
    // Checks if the file is an image
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

  /**
   * Handles drag events for the image input field.
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
   * Handles the drop event for the image input field.
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
   * File input click handler
   */
  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  /**
   * Clears selected image
   */
  const clearImage = () => {
    setImage(null);
    setPreviewURL(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
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
      const platesFromOpenCV = await detectLicensePlates(image);
      console.log("Plates from OpenCV:", platesFromOpenCV);

      if (platesFromOpenCV.length > 0) {
        onLicensePlatesDetected(platesFromOpenCV);
        return;
      }

      const fallbackResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/license-plate`,
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
    <div className="space-y-4">
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
            <img
              src={previewURL || "/placeholder.svg"}
              alt="License plate preview"
              className="mx-auto max-h-[300px] rounded-md object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Upload className="h-6 w-6 text-gray-500" />
            </div>
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
      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertDescription className="flex items-center gap-2">
            {error}
          </AlertDescription>
        </Alert>
      )}

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
