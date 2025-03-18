"use client";

import LicensePlateUpload from "@/components/license-plate-upload";
import { supabase } from "@/utils/supabase/client";
import { useCallback, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Webcam from "react-webcam";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { PlateUserInfo } from "@/lib/types";

/*
 * LicensePlatePage:
 *
 * This page provides a user interface for detecting license plates from uploaded images
 * or through webcam. It integrates with a license plate recognition API and supabase to fetch user
 * info associated with the license plate
 */
export default function LicensePlatePage() {
  // State variables using useState hook
  const [platesInfo, setPlatesInfo] = useState<PlateUserInfo[]>([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  /**
   * handleLicensePlateDetected:
   * Handles the detected license plate by removing whitespace
   * and fetching associated user information.
   */
  const handleLicensePlatesDetected = async (plates: string[]) => {
    const cleanedPlates = plates.map((p) => p.replace(/\s/g, ""));
    const results = await Promise.all(
      cleanedPlates.map(async (plate) => {
        const userInfo = await fetchLicensePlateInfo(plate);
        return userInfo
          ? {
              plate,
              email: userInfo.email,
              phone_number: userInfo.phone_number,
            }
          : { plate };
      }),
    );

    setPlatesInfo(results);
  };

  /**
   * fetchLicensePlateInfo:
   * Fetches user information from supabase based on the provided
   * license plate.
   */
  const fetchLicensePlateInfo = async (plate: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email, phone_number")
        .eq("license_plate", plate);

      if (error) {
        console.error("Error fetching user info:", error);
        return null;
      }

      if (data && data.length > 0) {
        return {
          email: data[0].email,
          phone_number: data[0].phone_number,
        };
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
      return null;
    }
  };

  /**
   * capture:
   * Captures an image from the webcam and processes it to detect license plate
   */
  const capture = useCallback(async () => {
    if (webcamRef.current) {
      // Takes a screenshot from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const blob = await (await fetch(imageSrc)).blob();
        const file = new File([blob], "captured-image.jpg", {
          type: "image/jpeg",
        });

        // Sends the captured image to be processed
        handleWebcamImage(file);
        // Hides webcam after taking image
        setShowWebcam(false);
      }
    }
  }, [webcamRef]);

  /*
   * handleWebcamImage:
   * Sends captured image to the recognition API and handles response
   */
  const handleWebcamImage = async (image: File) => {
    const formData = new FormData();
    formData.append("image", image);

    try {
      // Sends the image to the recognition API
      const response = await axios.post(
        "http://localhost:8080/license-plate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data && response.data.license_plate) {
        handleLicensePlatesDetected(response.data.license_plates);
      } else {
        console.error("License plate not found.");
      }
    } catch (err: any) {
      // Handles error during the API request
      console.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to detect license plate.",
      );
    }
  };

  // Configuration for the webcam
  const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: "environment",
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-2 bg-gray-100">
      <Card className="w-full p-2 max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Link href="/garage">
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <CardTitle>License Plate Recognition</CardTitle>
            <div />
          </div>
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
                videoConstraints={videoConstraints}
                className="rounded-md"
              />
              <Button
                onClick={capture}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
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
                <div key={p.plate} className="border p-2 rounded">
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
