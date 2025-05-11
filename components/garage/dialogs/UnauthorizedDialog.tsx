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
 * Props for the UnauthorizedDialog component.
 * @param open - Whether the dialog is open
 * @param onOpenChange - Function to handle dialog open state changes
 */
interface UnauthorizedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * A dialog component that shows when a user tries to perform an unauthorized action.
 *
 * Displays a message explaining that users can only unreserve their own spots.
 * @param {UnauthorizedDialogProps} props - The props for the UnauthorizedDialog component
 */
export function UnauthorizedDialog({
  open,
  onOpenChange,
}: UnauthorizedDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unauthorized Action</AlertDialogTitle>
          <AlertDialogDescription>
            You can only unreserve parking spots that you have reserved
            yourself.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
