"use client";

import {
  PlateInfo,
  PlateInfoCard,
} from "@/components/licenseplate/PlateInfoCard";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * Props for the VehicleInfoDialog component.
 * @param open - Whether the dialog is open
 * @param onOpenChangeAction - Function to handle dialog open state changes
 * @param plateInfo - Information about the vehicle's license plate
 */
interface VehicleInfoDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  plateInfo: PlateInfo | null;
}

/**
 * A dialog component that displays detailed information about a vehicle.
 *
 * Shows license plate information in a styled card with animation effects.
 * @param {VehicleInfoDialogProps} props - The props for the VehicleInfoDialog component
 */
export function VehicleInfoDialog({
  open,
  onOpenChangeAction,
  plateInfo,
}: VehicleInfoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChangeAction}>
      <AlertDialogTrigger className="hidden" />
      <AlertDialogContent className="max-w-md rounded-none border-0 p-0 shadow-lg sm:rounded-2xl">
        {/* Dialog header with gradient background */}
        <div
          className="relative overflow-hidden rounded-none bg-neutral-900 to-blue-700 p-6 text-white
            sm:rounded-t-2xl"
        >
          <AlertDialogHeader className="items-start space-y-1 text-left">
            <div className="flex items-center justify-between">
              <AlertDialogTitle className="text-2xl font-bold tracking-tight text-white">
                Vehicle Information
              </AlertDialogTitle>
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/10 text-white
                  hover:bg-white/20"
                onClick={() => onOpenChangeAction(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </AlertDialogHeader>
        </div>

        {/* Vehicle information content */}
        <div className="p-6">
          {plateInfo && <PlateInfoCard info={plateInfo} />}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
