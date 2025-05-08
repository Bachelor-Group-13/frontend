"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface PlateRecognitionLayoutProps {
  children: ReactNode;
}

export default function PlateRecognitionLayout({
  children,
}: PlateRecognitionLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-8">
      <div className="container mx-auto px-4">
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
        {children}
      </div>
    </div>
  );
}
