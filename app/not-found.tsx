import Link from "next/link";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The 404 Not Found page component.
 * Displays a user-friendly error message when a user navigates to a non-existent page.
 * Includes a link to return to the home page.
 *
 * @returns The rendered not found page
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="max-w-md space-y-8 rounded-lg bg-white p-6 text-center shadow-md">
        <div className="flex items-center justify-center space-x-3">
          <Car className="h-12 w-12 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-800">Page Not Found</h1>
        </div>
        <p className="text-sm text-gray-600">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button className="text-md mt-5 w-full bg-gray-800 hover:bg-gray-700">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
