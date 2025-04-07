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
import { TabsContent, TabsTrigger, Tabs, TabsList } from "@/components/ui/tabs";
import { useLicensePlateDetection } from "@/hooks/useLicensePlateDetection";
import { useWebcamCapture } from "@/hooks/useWebcamCapture";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Car,
  CheckCircle2,
  Mail,
  Phone,
  Upload,
  User,
} from "lucide-react";
import { useState } from "react";
import Webcam from "react-webcam";
import Link from "next/link";

export default function ParkingDetectionPage() {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const { platesInfo, handleLicensePlatesDetected } =
    useLicensePlateDetection();
  const { webcamRef, capture } = useWebcamCapture(handleLicensePlatesDetected);
  const [processing, setProcessing] = useState(false);

  const handleCapture = async () => {
    setProcessing(true);
    await capture();
    setProcessing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between">
          <Link
            href="/garage"
            className="rounded-full p-2 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            License Plate Recognition
          </h1>
          <div className="w-8" />
        </div>
        <p className="mt-2 text-center max-w-2xl mx-auto text-gray-500">
          Identify license plates and find associated user information
        </p>
      </div>

      {/* Card Section */}
      <div className="mx-auto max-w-3xl">
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-2 text-2xl">
              License Plate Scanner
            </CardTitle>
            <CardDescription>
              Upload an image to detect the license plates and find vehicle
              owners.
            </CardDescription>
          </CardHeader>

          <Tabs
            defaultValue="upload"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b px-6 py-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Use Camera
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6">
              <TabsContent value="upload" className="mt-0">
                <LicensePlateUpload
                  onLicensePlatesDetected={handleLicensePlatesDetected}
                />
              </TabsContent>

              <TabsContent value="camera" className="mt-0">
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
                        onClick={handleCapture}
                        disabled={processing}
                        className="mx-auto flex w-full max-w-xs items-center justify-center gap-2 bg-white
                          text-neutral-900 hover:bg-gray-100"
                      >
                        {processing ? (
                          <>
                            <div
                              className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900
                                border-t-transparent"
                            ></div>
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
                    Position the license plate clearly in the frame and click
                    the capture button.
                  </p>
                </div>
              </TabsContent>

              {platesInfo.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="font-bold">Detected Plates:</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {platesInfo.map((plateInfo) => (
                      <Card key={plateInfo.plate} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 p-4">
                          <CardTitle className="flex items-center text-lg">
                            <Car className="mr-3 h-6 w-6" />
                            {plateInfo.plate}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          {plateInfo.email && plateInfo.phone_number ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {plateInfo.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {plateInfo.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {plateInfo.phone_number}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600">
                              <AlertCircle className="h-4 w-4" />
                              <p className="text-sm">
                                No user found for this plate.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
