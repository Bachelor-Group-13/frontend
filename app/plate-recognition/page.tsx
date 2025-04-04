"use client";

import LicensePlateUpload from "@/components/license-plate-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLicensePlateDetection } from "@/hooks/useLicensePlateDetection";
import { useWebcamCapture } from "@/hooks/useWebcamCapture";
import { useState } from "react";
import Webcam from "react-webcam";

export default function ParkingDetectionPage() {
  const [showWebcam, setShowWebcam] = useState(false);
  const { platesInfo, handleLicensePlatesDetected } =
    useLicensePlateDetection();
  const { webcamRef, capture } = useWebcamCapture(handleLicensePlatesDetected);

  return (
    <div className="p-6">
    <Card>
      <CardHeader>
        <CardTitle>License Plate Recognition</CardTitle>
        <CardDescription>
          Upload an image to detect the license plate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="bg-neutral-900"
          onClick={() => setShowWebcam(!showWebcam)}
        >
          {showWebcam ? "Hide Camera" : "Open Camera"}
        </Button>

        {showWebcam && (
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 480,
                height: 360,
                facingMode: "environment",
              }}
              className="rounded-md"
            />
            <Button
              onClick={capture}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 transform"
            >
              Capture
            </Button>
          </div>
        )}

        <LicensePlateUpload
          onLicensePlatesDetected={handleLicensePlatesDetected}
        />

        {platesInfo.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-bold">Detected Plates:</h3>
            {platesInfo.map((p) => (
              <div key={p.plate} className="rounded border p-2">
                <p className="font-semibold">Plate: {p.plate}</p>
                {p.email && p.phone_number ? (
                  <div>
                    <p>Email: {p.email}</p>
                    <p>Phone: {p.phone_number}</p>
                  </div>
                ) : (
                  <p>No user found for this plate.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
