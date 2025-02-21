import Link from "next/link";
import { Button } from "@/components/ui/button";

/*
 * LandingPage:
 *
 * The landing page for the application.
 * It has a button to navigate to the authentication page.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="max-w-xl w-full text-center bg-white shadow-md rounded-lg p-6">
        <h1 className="text-4xl font-bold font-mono text-gray-800 mb-4">
          Inneparkert
        </h1>
        <div className="p-2" />

        <Link href="/auth">
          <Button className="w-full bg-gray-800 hover:bg-gray-500 text-white">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
