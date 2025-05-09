"use client";

import { CheckCircle2 } from "lucide-react";
import { PlateInfo, PlateInfoCard } from "./PlateInfoCard";

interface DetectedPlatesProps {
  platesInfo: PlateInfo[];
}

export function DetectedPlates({ platesInfo }: DetectedPlatesProps) {
  if (platesInfo.length === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <h3 className="font-bold">Detected Plates:</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {platesInfo.map((info) => (
          <PlateInfoCard key={info.plate} info={info} />
        ))}
      </div>
    </div>
  );
}
