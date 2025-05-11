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
      <div className="container mx-auto px-4">
        {/* Header section with back button and title */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/garage"
            className="rounded-full p-2 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">License Plate Recognition</h1>
          <div className="w-5" />
        </div>
        {/* Main content area */}
        {children}
      </div>
    </div>
  );
}
