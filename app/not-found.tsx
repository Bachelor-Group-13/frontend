import Link from "next/link";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
 * NotFound Page:
 *
 * This page is displayed when a user navigates to a page
 * that does not exist. It displays a user friendly message and
 * link back to home page
 */
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md space-y-8 p-6 text-center bg-white shadow-md rounded-lg">
        <div className="flex items-center justify-center space-x-3">
          <Car className="w-12 h-12 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-800">Page Not Found</h1>
        </div>
        <p className="text-sm text-gray-600">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button className="w-full bg-gray-800 hover:bg-gray-700 text-md mt-5">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
