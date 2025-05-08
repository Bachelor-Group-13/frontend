"use client";

import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Webcam from "react-webcam";

interface CameraTabProps {
  webcamRef: React.RefObject<Webcam>;
  processing: boolean;
  onCapture: () => void;
}

export function CameraTab({
  webcamRef,
  processing,
  onCapture,
}: CameraTabProps) {
  return (
    <div className="space-y-4">
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <Button
            onClick={onCapture}
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
      <p className="text-center text-sm text-gray-500">
        Position the license plate clearly in the frame and click the capture
        button.
      </p>
    </div>
  );
}
