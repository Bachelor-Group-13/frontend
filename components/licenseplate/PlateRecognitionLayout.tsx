"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

/**
 * Props for the PlateRecognitionLayout component.
 * @param children - The content to be rendered inside the layout
 */
interface PlateRecognitionLayoutProps {
  children: ReactNode;
}

/**
 * A layout component for the license plate recognition section.
 *
 * Provides a layout with a back button, title, and content area.
 */
export default function PlateRecognitionLayout({
  children,
}: PlateRecognitionLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header section with back button and title */}
        <div className="mb-8">
          <Link
            href="/garage"
            className="inline-flex items-center rounded-full px-3 py-2 text-gray-700 transition
              hover:bg-gray-200"
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="ml-2 font-medium">Back to Garage</span>
          </Link>
        </div>
        {/* Main content area */}
        {children}
      </div>
    </div>
  );
}
