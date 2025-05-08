"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Mail,
  Phone,
  User,
} from "lucide-react";

interface PlateInfo {
  plate: string;
  name?: string;
  email?: string;
  phone_number?: string;
}

interface DetectedPlatesProps {
  platesInfo: PlateInfo[];
}

export function DetectedPlates({ platesInfo }: DetectedPlatesProps) {
  if (platesInfo.length === 0) return null;

  return (
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
                    <span className="text-sm">{plateInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{plateInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{plateInfo.phone_number}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">No user found for this plate.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
