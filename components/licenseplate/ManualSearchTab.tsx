"use client";

import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

/**
 * Props for the ManualSearchTab component.
 * @param manualPlate - The current value of the license plate input
 * @param onManualPlateChangeAction - Function to handle changes to the license plate input
 * @param onSearchAction - Function to handle the search button click
 */
interface ManualSearchTabProps {
  manualPlate: string;
  onManualPlateChangeAction: (value: string) => void;
  onSearchAction: () => void;
}

/**
 * A component that provides a manual input field for searching license plates.
 *
 * Features a text input field for entering license plate numbers and a search button.
 */
export function ManualSearchTab({
  manualPlate,
  onManualPlateChangeAction,
  onSearchAction,
}: ManualSearchTabProps) {
  return (
    <div className="space-y-4">
      {/* Input section */}
      <div className="space-y-2">
        <Label htmlFor="license-plate" className="text-sm font-medium">
          License Plate Number
        </Label>
        {/* Input and search button */}
        <div className="flex gap-2">
          <Input
            id="license-plate"
            value={manualPlate}
            onChange={(e) =>
              onManualPlateChangeAction(e.target.value.toUpperCase())
            }
            placeholder="Enter Plate Number"
            className="flex-1"
          />
          <Button
            onClick={onSearchAction}
            disabled={!manualPlate.trim()}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Enter the license plate number in the format "AB12345"
        </p>
      </div>
    </div>
  );
}
