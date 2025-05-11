import {
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AlertDialogContent } from "@/components/ui/alert-dialog";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

/**
 * Props for the PasswordMismatchDialog component
 *
 * @interface PasswordMismatchDialogProps
 * @property {boolean} open - Whether the dialog is visible
 * @property {(open: boolean) => void} onOpenChange - Called when dialog visibility changes
 */
interface PasswordMismatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * A dialog component that displays a password mismatch error message.
 * Used when the password and confirm password fields don't match.
 *
 * @param {PasswordMismatchDialogProps} props - The component props
 * @returns A styled alert dialog with password mismatch information
 */
export function PasswordMismatchDialog({
  open,
  onOpenChange,
}: PasswordMismatchDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Password Mismatch
          </AlertDialogTitle>
          <AlertDialogDescription>
            Passwords do not match. Please try again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
