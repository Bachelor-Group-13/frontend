"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Car, Mail, Phone, User } from "lucide-react";

export interface PlateInfo {
  plate: string;
  name?: string;
  email?: string;
  phone_number?: string;
}

interface PlateInfoCardProps {
  info: PlateInfo;
}

export function PlateInfoCard({ info }: PlateInfoCardProps) {
  const hasOwner = !!(info.email && info.phone_number);
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 p-4">
        <CardTitle className="flex items-center text-lg">
          <Car className="mr-3 h-6 w-6" />
          {info.plate}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {hasOwner ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{info.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{info.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{info.phone_number}</span>
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
  );
}
