"use client";

import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Webcam from "react-webcam";

/**
 * Props for the CameraTab component.
 * @param webcamRef - Reference to the webcam component
 * @param processing - Whether the camera is currently processing an image
 * @param onCaptureAction - Function to call when the capture button is clicked
 */
interface CameraTabProps {
  webcamRef: React.RefObject<Webcam>;
  processing: boolean;
  onCaptureAction: () => void;
}

/**
 * A component that provides a camera interface for capturing license plates.
 *
 * Displays a camera feed with a capture button.
 * Uses the device's back camera by default for better license plate capture.
 */
export function CameraTab({
  webcamRef,
  processing,
  onCaptureAction,
}: CameraTabProps) {
  return (
    <div className="space-y-4">
      {/* Camera feed container */}
      <div className="relative overflow-hidden rounded-lg border bg-gray-50">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "environment",
          }}
          className="mx-auto w-full"
        />
        {/* Capture button overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <Button
            onClick={onCaptureAction}
            disabled={processing}
            className="mx-auto flex w-full max-w-xs items-center justify-center gap-2 bg-white
              text-neutral-900 hover:bg-gray-100"
          >
            {processing ? (
              <>
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900
                    border-t-transparent"
                />
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Capture License Plate
              </>
            )}
          </Button>
        </div>
      </div>
      {/* Instructions text */}
      <p className="text-center text-sm text-gray-500">
        Position the license plate clearly in the frame and click the capture
        button.
      </p>
    </div>
  );
}
