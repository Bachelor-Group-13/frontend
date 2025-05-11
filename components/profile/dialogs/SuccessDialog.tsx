import { CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Props for the SuccessDialog component
 *
 * @interface SuccessDialogProps
 * @property {boolean} open - Whether the dialog is visible
 * @property {(open: boolean) => void} onOpenChange - Called when dialog visibility changes
 * @property {() => void} onSuccess - Called when the success action is triggered
 */
interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * A dialog component that displays a success message after profile updates.
 * Shows a confirmation message and provides a button to return to the garage.
 *
 * @param {SuccessDialogProps} props - The component props
 * @returns A styled alert dialog with success information
 */
export function SuccessDialog({
  open,
  onOpenChange,
  onSuccess,
}: SuccessDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Profile Updated
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your profile has been successfully updated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onSuccess}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            Back to Garage
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
