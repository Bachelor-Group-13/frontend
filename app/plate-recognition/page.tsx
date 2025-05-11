"use client";

import { useState } from "react";
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

export default function PlateRecognitionPage() {
  const [activeTab, setActiveTab] = useState<string>("manual");
  const { platesInfo, handleLicensePlatesDetected } =
    useLicensePlateDetection();
  const { webcamRef, capture } = useWebcamCapture(handleLicensePlatesDetected);
  const [processing, setProcessing] = useState(false);
  const [manualPlate, setManualPlate] = useState("");
  const { user } = useAuth();

  const handleCapture = async () => {
    setProcessing(true);
    await capture();
    setProcessing(false);
  };

  const handleManualSearch = () => {
    if (manualPlate.trim()) {
      handleLicensePlatesDetected([manualPlate.trim().toUpperCase()]);
    }
  };

  return (
    <PlateRecognitionLayout>
      <div className="mx-auto max-w-3xl">
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-2 text-2xl">
              License Plate Recognition
            </CardTitle>
            <CardDescription>
              Find vehicle owners by license plate using one of the methods
              below.
            </CardDescription>
          </CardHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <PlateRecognitionTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <CardContent className="p-6">
              <TabsContent className="mt-0" value="manual">
                <ManualSearchTab
                  manualPlate={manualPlate}
                  onManualPlateChangeAction={setManualPlate}
                  onSearchAction={handleManualSearch}
                />
              </TabsContent>

              <TabsContent value="camera" className="mt-0">
                <CameraTab
                  webcamRef={webcamRef as React.RefObject<Webcam>}
                  processing={processing}
                  onCapture={handleCapture}
                />
              </TabsContent>

              {user && user?.role === "ROLE_DEVELOPER" && (
                <TabsContent value="upload" className="mt-0">
                  <LicensePlateUpload
                    onLicensePlatesDetected={handleLicensePlatesDetected}
                  />
                </TabsContent>
              )}

              <DetectedPlates platesInfo={platesInfo} />
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </PlateRecognitionLayout>
  );
}
