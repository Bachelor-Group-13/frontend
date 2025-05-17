"use client";

import React, { RefObject, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useLicensePlateDetection } from "@/lib/hooks/useLicensePlateDetection";
import { useWebcamCapture } from "@/lib/hooks/useWebcamCapture";
import { useAuth } from "@/components/auth/AuthContext";
import LicensePlateUpload from "@/components/licenseplate/LicensePlateUpload";
import PlateRecognitionLayout from "@/components/licenseplate/PlateRecognitionLayout";
import { PlateRecognitionTabs } from "@/components/licenseplate/PlateRecognitionTabs";
import { ManualSearchTab } from "@/components/licenseplate/ManualSearchTab";
import { CameraTab } from "@/components/licenseplate/CameraTab";
import { DetectedPlates } from "@/components/licenseplate/DetectedPlates";
import Webcam from "react-webcam";

/**
 * License plate recognition page component.
 * Provides multiple methods for license plate detection:
 * - Manual search
 * - Camera capture
 * - Image upload (developer only)
 *
 * @returns The rendered plate recognition page
 */
export default function PlateRecognitionPage() {
  const [activeTab, setActiveTab] = useState<string>("manual");
  const { platesInfo, handleLicensePlatesDetected } =
    useLicensePlateDetection();
  const { webcamRef, capture } = useWebcamCapture(handleLicensePlatesDetected);
  const [processing, setProcessing] = useState(false);
  const [manualPlate, setManualPlate] = useState("");
  const { user } = useAuth();

  // Handles the camera capture process
  const handleCapture = async () => {
    setProcessing(true);
    await capture();
    setProcessing(false);
  };

  // Handles manual license plate search
  const handleManualSearch = () => {
    if (manualPlate.trim()) {
      handleLicensePlatesDetected([manualPlate.trim().toUpperCase()]);
    }
  };

  return (
    <PlateRecognitionLayout>
      {/* Card container for the recognition interface */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="pb-8">
          <CardTitle className="flex items-center gap-2 text-2xl">
            License Plate Recognition
          </CardTitle>
          <CardDescription>
            Find vehicle owners by license plate using one of the methods below.
          </CardDescription>
        </CardHeader>

        {/* Tabs for the different methods */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab navigation */}
          <PlateRecognitionTabs
            activeTab={activeTab}
            onTabChangeAction={setActiveTab}
          />

          <CardContent className="p-6">
            {/* Manual search tab */}
            <TabsContent className="mt-0" value="manual">
              <ManualSearchTab
                manualPlate={manualPlate}
                onManualPlateChangeAction={setManualPlate}
                onSearchAction={handleManualSearch}
              />
            </TabsContent>

            {/* Camera capture tab */}
            <TabsContent value="camera" className="mt-0">
              <CameraTab
                webcamRef={webcamRef as RefObject<Webcam>}
                processing={processing}
                onCaptureAction={handleCapture}
              />
            </TabsContent>

            {/* Image upload tab (developer only) */}
            {user && user?.role === "ROLE_DEVELOPER" && (
              <TabsContent value="upload" className="mt-0">
                <LicensePlateUpload
                  onLicensePlatesDetected={handleLicensePlatesDetected}
                />
              </TabsContent>
            )}

            {/* Result display */}
            <DetectedPlates platesInfo={platesInfo} />
          </CardContent>
        </Tabs>
      </Card>
    </PlateRecognitionLayout>
  );
}
