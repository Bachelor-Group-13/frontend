import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface ProfileCardProps {
  name: string;
  email: string;
  children: React.ReactNode;
  onUpdate: () => void;
  isSubmitting: boolean;
  licensePlateError: string | null;
}

export default function ProfileCard({
  name,
  email,
  children,
  onUpdate,
  isSubmitting,
  licensePlateError,
}: ProfileCardProps) {
  return (
    <Card className="mb-6 overflow-hidden shadow-md">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-xl
              font-bold text-white"
          >
            {name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"}
          </div>
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {email}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">{children}</div>
      </CardContent>

      <CardFooter className="flex justify-end border-t bg-gray-50 p-6">
        <Button
          onClick={onUpdate}
          className="bg-neutral-900 hover:bg-neutral-800"
          disabled={isSubmitting || licensePlateError !== null}
        >
          {isSubmitting ? (
            <>
              <span
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white
                  border-t-transparent"
              />
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
