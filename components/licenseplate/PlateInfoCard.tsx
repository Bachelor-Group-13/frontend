"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Car, Mail, MessageCircle, Phone, User } from "lucide-react";

/**
 * Information about a license plate and its associated user.
 * @param plate - The license plate number
 * @param name - Optional name of the vehicle owner
 * @param email - Optional email of the vehicle owner
 * @param phone_number - Optional phone number of the vehicle owner
 */
export interface PlateInfo {
  plate: string;
  name?: string;
  email?: string;
  phone_number?: string;
}

/**
 * Props for the PlateInfoCard component.
 * @param info - The license plate information to display
 */
interface PlateInfoCardProps {
  info: PlateInfo;
}

/**
 * A component that displays license plate information in a card format.
 *
 * Shows the plate number in the header and owner details in the content.
 */
export function PlateInfoCard({ info }: PlateInfoCardProps) {
  const hasOwner = !!(info.email && info.phone_number);
  return (
    <Card className="overflow-hidden">
      {/* Card header with plate number */}
      <CardHeader className="bg-gray-50 p-4">
        <CardTitle className="flex items-center text-lg">
          <Car className="mr-3 h-6 w-6" />
          {info.plate}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {hasOwner ? (
           <>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{info.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {info.email}
                </span>
                <a
                  href={`mailto:${info.email}`}
                  className="text-neutral-900 hover:text-blue-700"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {info.phone_number}
                </span>
                <div className="flex space-x-2">
                  <a
                    href={`tel:${info.phone_number}`}
                    className="text-neutral-900 hover:text-blue-700"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                  <a
                    href={`sms:${info.phone_number}`}
                    className="text-neutral-900 hover:text-green-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </>
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
