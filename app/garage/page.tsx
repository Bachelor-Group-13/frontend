"use client";
import { GarageLayout } from "@/components/garage/GarageLayout";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

/**
 * Garage page component.
 * Renders the main garage interface with a responsive container.
 *
 * @returns The rendered garage page
 */
export default function GaragePage() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-gray-100">
        <div className="flex flex-grow items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="bg-gray-50 p-3 sm:p-6">
              <GarageLayout />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
      <ToastViewport className="fixed right-4 top-4 z-50" />
    </ToastProvider>
  );
}
