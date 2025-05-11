import {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

/**
 * Props for the ErrorDialog component
 *
 * @interface ErrorDialogProps
 * @property {boolean} open - Whether the dialog is visible
 * @property {(open: boolean) => void} onOpenChange - Called when dialog visibility changes
 * @property {string} message - Error message to show
 * @property {boolean} [isFetchError] - If true, shows fetch error styling
 * @property {() => void} [onAction] - Optional action button handler
 */
interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  isFetchError?: boolean;
  onAction?: () => void;
}

/**
 * A reusable error dialog component that displays error messages with an action button.
 *
 * @param {ErrorDialogProps} props - The component props
 * @returns A styled alert dialog with error information
 */
export function ErrorDialog({
  open,
  onOpenChange,
  message,
  isFetchError,
  onAction,
}: ErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            {isFetchError ? "Error Loading Profile" : "Error"}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onAction || (() => onOpenChange(false))}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            {isFetchError ? "Go to Garage" : "OK"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
