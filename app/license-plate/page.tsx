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

/*
 * LicensePlatePage:
 *
 * This page provides a user interface for detecting license plates from uploaded images
 * or through webcam. It integrates with a license plate recognition API and supabase to fetch user
 * info associated with the license plate
 */
export default function LicensePlatePage() {
  // State variables using useState hook
  const [detectedLicensePlate, setDetectedLicensePlate] = useState<
    string | null
  >(null);
  const [licensePlateInfo, setLicensePlateInfo] = useState<any>(null);
  const [showWebcam, setShowWebcam] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  /**
   * handleLicensePlateDetected function:
   *
   * Handles the detected license plate by removing whitespace
   * and fetching associated user information.
   */
  const handleLicensePlateDetected = (licensePlate: string) => {
    const cleanedLicensePlate = licensePlate.replace(/\s/g, "");
    setDetectedLicensePlate(cleanedLicensePlate);
    fetchLicensePlateInfo(cleanedLicensePlate);
  };

  /**
   * fetchLicensePlateInfo function:
   *
   * Fetches user information from supabase based on the provided
   * license plate.
   */
  const fetchLicensePlateInfo = async (licensePlate: string) => {
    console.log("Fetching user info for license plate:", licensePlate);
    // Queries the users table in supabase for matching license plate
    const { data, error } = await supabase
      .from("users")
      .select("email, phone_number")
      .eq("license_plate", licensePlate);

    // Handles error fetching user info, resets user info on error
    console.log("Supabase query result:", { data, error });
    if (error) {
      console.error("Error fetching user info:", error);
      setLicensePlateInfo(null);
      return;
    }

    // Sets user info if found, and resets if no user is found
    if (data && data.length > 0) {
      setLicensePlateInfo(data[0]);
    } else {
      setLicensePlateInfo(null);
      console.log("No user found with that license plate");
    }
  };

  /**
   * capture function:
   *
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
   * handleWebcamImage function:
   *
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
        handleLicensePlateDetected(response.data.license_plate);
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
            onLicensePlateDetected={handleLicensePlateDetected}
          />
          {detectedLicensePlate && (
            <div>
              <p>Detected License Plate: {detectedLicensePlate}</p>
              {licensePlateInfo ? (
                <div>
                  <p>Email: {licensePlateInfo.email}</p>
                  <p>Phone: {licensePlateInfo.phone_number}</p>
                </div>
              ) : (
                <p>No user found with that license plate.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
