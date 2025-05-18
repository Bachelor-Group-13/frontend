import { format } from "date-fns";
import { Clock } from "lucide-react";
import { ParkingSpot, User } from "@/lib/utils/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { VehicleInfoDialog } from "./VehicleInfoDialog";

/**
 * Props for the ReservationDialog component.
 * @param selectedSpot - The parking spot being reserved
 * @param setSelectedSpot - Function to update the selected spot
 * @param user - The current user data
 * @param selectedLicensePlate - The currently selected license plate
 * @param setSelectedLicensePlate - Function to update the selected license plate
 * @param estimatedDeparture - The estimated departure time
 * @param setEstimatedDeparture - Function to update the estimated departure time
 * @param handleReservation - Function to handle spot reservation
 * @param handleClaimSpot - Function to handle claiming an anonymous spot
 */
interface ReservationDialogProps {
  selectedSpot: ParkingSpot;
  setSelectedSpot: (spot: ParkingSpot | null) => void;
  user: User | null;
  selectedLicensePlate: string | null;
  setSelectedLicensePlate: (plate: string | null) => void;
  estimatedDeparture: Date | null;
  setEstimatedDeparture: (date: Date | null) => void;
  handleReservation: () => Promise<void>;
  handleClaimSpot: () => Promise<void>;
}

/**
 * A dialog component for managing parking spot reservations.
 *
 * Handles reserving spots, claiming anonymous spots, and setting departure times.
 * @param {ReservationDialogProps} props - The props for the ReservationDialog component
 */
export function ReservationDialog({
  selectedSpot,
  setSelectedSpot,
  user,
  selectedLicensePlate,
  setSelectedLicensePlate,
  estimatedDeparture,
  setEstimatedDeparture,
  handleReservation,
  handleClaimSpot,
}: ReservationDialogProps) {
  const isAnonymous =
    selectedSpot.isOccupied && selectedSpot.occupiedBy?.anonymous;
  const isUserSpot =
    selectedSpot.isOccupied && selectedSpot.occupiedBy?.user_id === user?.id;
  const isOccupied = selectedSpot.isOccupied;

  // Get a dialog title based on spot status
  const getDialogTitle = () => {
    if (isAnonymous) return `Claim Spot ${selectedSpot.spotNumber}?`;
    if (isUserSpot) return `Unreserve Spot ${selectedSpot.spotNumber}?`;
    if (isOccupied)
      return `Spot ${selectedSpot.spotNumber} is Already Reserved`;
    return `Reserve Spot ${selectedSpot.spotNumber}?`;
  };

  // Get dialog description based on spot status
  const getDialogDescription = () => {
    if (isAnonymous) return "Do you want to claim this spot as yours?";
    if (isUserSpot) return "Do you want to make this spot available again?";
    if (isOccupied) return "This spot is currently reserved by someone else.";
    return "Do you want to reserve this spot for the rest of the day?";
  };

  // Handle time input change
  const handleTimeChange = (value: string) => {
    if (value) {
      const [hours, minutes] = value.split(":");
      const date = new Date();
      const reservationDate = new Date().toISOString().split("T")[0];
      date.setFullYear(
        parseInt(reservationDate.split("-")[0]),
        parseInt(reservationDate.split("-")[1]) - 1,
        parseInt(reservationDate.split("-")[2])
      );
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setEstimatedDeparture(date);
    } else {
      setEstimatedDeparture(null);
    }
  };

  // Handle dialog action based on spot status
  const handleAction = () => {
    if (isAnonymous) {
      handleClaimSpot();
    } else {
      handleReservation();
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={() => setSelectedSpot(null)}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDialogDescription()}
          </AlertDialogDescription>
          {/* Show occupant info when the spot is occupied */}
          {isOccupied && selectedSpot.occupiedBy && !isAnonymous && (
            <div className="mt-4">
              {isUserSpot ? (
                <div />
              ) : (
                <VehicleInfoDialog
                  open={true}
                  onOpenChangeAction={() => setSelectedSpot(null)}
                  plateInfo={{
                    plate: selectedSpot.occupiedBy.license_plate || "",
                    name: selectedSpot.occupiedBy.name || undefined,
                    email: selectedSpot.occupiedBy.email || undefined,
                    phone_number:
                      selectedSpot.occupiedBy.phone_number || undefined,
                  }}
                />
              )}
            </div>
          )}
          {/* License plate selection and departure time */}
          {(!isOccupied || isAnonymous) && user && (
            <div className="mt-4">
              <Label
                htmlFor="license-plate-select"
                className="mt-2 block text-sm font-medium text-gray-700"
              >
                Select License Plate
              </Label>
              <Select
                value={selectedLicensePlate || ""}
                onValueChange={setSelectedLicensePlate}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a license plate" />
                </SelectTrigger>
                <SelectContent>
                  {user.license_plate && (
                    <SelectItem value={user.license_plate}>
                      {user.license_plate}
                    </SelectItem>
                  )}
                  {user.second_license_plate && (
                    <SelectItem value={user.second_license_plate}>
                      {user.second_license_plate}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {/* Departure time input */}
              <div className="mt-4">
                <Label className="mt-2 block text-sm font-medium text-gray-700">
                  Estimated Departure Time (Optional)
                </Label>
                <div className="relative">
                  <input
                    type="time"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                      ring-offset-background file:border-0 file:bg-transparent file:text-sm
                      file:font-medium placeholder:text-muted-foreground focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                      disabled:cursor-not-allowed disabled:opacity-50"
                    value={
                      estimatedDeparture
                        ? format(estimatedDeparture, "HH:mm")
                        : ""
                    }
                    onChange={(e) => handleTimeChange(e.target.value)}
                  />
                </div>
                {/* Departure time display */}
                {estimatedDeparture && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Estimated departure at{" "}
                      {format(estimatedDeparture, "HH:mm")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </AlertDialogHeader>
        {/* Dialog actions */}
        <AlertDialogFooter className="mt-4 flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0">
          <AlertDialogCancel onClick={() => setSelectedSpot(null)}>
            Cancel
          </AlertDialogCancel>
          {(!isOccupied || isUserSpot || isAnonymous) && (
            <AlertDialogAction
              onClick={handleAction}
              className={
                isOccupied && !isAnonymous
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {isAnonymous
                ? "Claim Spot"
                : isOccupied
                  ? "Unreserve"
                  : "Reserve"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
