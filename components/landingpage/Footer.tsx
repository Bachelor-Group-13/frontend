import { Car } from "lucide-react";

export function LandingPageFooter() {
  return (
    <footer className="mt-auto bg-white py-12">
      <div className="container mx-auto px-4">
        <div
          className="flex flex-col items-center justify-between gap-6 border-t border-gray-200 pt-8
            md:flex-row"
        >
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-neutral-900" />
            <span className="font-mono text-xl font-bold">Inneparkert</span>
          </div>

          <div className="text-center text-sm text-gray-600 md:text-right">
            <p className="mb-1">
              This app is intended for employees and registered users only.
            </p>
            <p>
              By signing in, you agree to share your registered information with
              Inneparkert and its users.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
