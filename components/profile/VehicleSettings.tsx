"use client";

import { Car, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

/**
 * Props for the VehicleSettings component.
 * @param primaryLicensePlate - The primary license plate value
 * @param onPrimaryLicensePlateChange - Function to handle primary license plate changes
 * @param secondLicensePlate - The secondary license plate value
 * @param onSecondLicensePlateChange - Function to handle secondary license plate changes
 * @param licensePlateError - Error message for license plate validation
 * @param showSecondLicensePlate - Whether to show the secondary license plate input
 * @param onShowSecondLicensePlate - Function to toggle secondary license plate input
 */
interface VehicleSettingsProps {
  primaryLicensePlate: string;
  onPrimaryLicensePlateChange: (value: string) => void;
  secondLicensePlate: string;
  onSecondLicensePlateChange: (value: string) => void;
  licensePlateError: string | null;
  showSecondLicensePlate: boolean;
  onShowSecondLicensePlate: () => void;
}

/**
 * A component that provides a form for managing vehicle license plates.
 *
 * Handles primary and optional secondary license plate inputs
 * with validation and formatting.
 */
export default function VehicleSettings({
  primaryLicensePlate,
  onPrimaryLicensePlateChange,
  secondLicensePlate,
  onSecondLicensePlateChange,
  licensePlateError,
  showSecondLicensePlate,
  onShowSecondLicensePlate,
}: VehicleSettingsProps) {
  return (
    <div>
      {/* Header */}
      <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
        <Car className="h-5 w-5 text-gray-500" />
        Vehicle Information
      </h3>

      {/* License plate form */}
      <div className="space-y-4">
        {/* Primary license plate input */}
        <div className="space-y-2">
          <Label htmlFor="license-plate" className="text-sm">
            Primary License Plate
          </Label>
          <div className="relative">
            <Input
              id="license-plate"
              type="text"
              value={primaryLicensePlate}
              onChange={(e) => onPrimaryLicensePlateChange(e.target.value)}
              placeholder="AB12345"
              className={licensePlateError ? "border-red-500" : ""}
              minLength={7}
              maxLength={7}
              autoCapitalize="characters"
            />
          </div>
          {licensePlateError && (
            <p className="text-xs text-red-500">{licensePlateError}</p>
          )}
        </div>

        {/* Secondary license plate section */}
        {!secondLicensePlate && !showSecondLicensePlate ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShowSecondLicensePlate}
            className="flex items-center gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Second License Plate
          </Button>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="second-license-plate" className="text-sm">
              Secondary License Plate
            </Label>
            <div className="relative">
              <Input
                id="second-license-plate"
                type="text"
                value={secondLicensePlate}
                onChange={(e) => onSecondLicensePlateChange(e.target.value)}
                placeholder="Second license plate"
                minLength={7}
                maxLength={7}
                autoCapitalize="characters"
              />
              {secondLicensePlate && (
                <Badge className="absolute right-2 top-2 bg-gray-500">
                  Secondary
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      <Separator className="mt-6" />
    </div>
  );
}
