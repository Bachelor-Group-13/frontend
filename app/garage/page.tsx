import { GarageLayout } from "@/components/garage-layout";

/**
 * Garage Page:
 *
 * Main page for the garage section. It includes a navbar
 * and the garage layout.
 */
export default function GaragePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <div className="flex flex-grow items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="bg-gray-50 p-3 sm:p-6">
            <GarageLayout />
          </div>
        </div>
      </div>
    </div>
  );
}
