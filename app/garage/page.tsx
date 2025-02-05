import GarageLayout from "@/components/garage-layout";
import { Navbar } from "@/components/navbar";

export default function GaragePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <div className="flex justify-center items-center flex-grow p-4">
        <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 bg-gray-50">
            <GarageLayout />
          </div>
        </div>
      </div>
    </div>
  );
}
