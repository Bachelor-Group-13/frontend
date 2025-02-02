"use client";
import { useState } from "react";

type ParkingSpot = {
  id: number;
  spotNumber: string;
  isOccupied: boolean;
};

export default function GarageLayout() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([
    { id: 1, spotNumber: "1A", isOccupied: false },
    { id: 2, spotNumber: "1B", isOccupied: false },
    { id: 3, spotNumber: "2A", isOccupied: false },
    { id: 4, spotNumber: "2B", isOccupied: false },
    { id: 5, spotNumber: "3A", isOccupied: false },
    { id: 6, spotNumber: "3B", isOccupied: false },
    { id: 7, spotNumber: "4A", isOccupied: false },
    { id: 8, spotNumber: "4B", isOccupied: false },
    { id: 9, spotNumber: "5A", isOccupied: false },
    { id: 10, spotNumber: "5B", isOccupied: false },
    { id: 11, spotNumber: "6A", isOccupied: false },
    { id: 12, spotNumber: "6B", isOccupied: false },
    { id: 13, spotNumber: "7A", isOccupied: false },
    { id: 14, spotNumber: "7B", isOccupied: false },
  ]);

  const toggleSpot = (id: number) => {
    setParkingSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.id === id ? { ...spot, isOccupied: !spot.isOccupied } : spot,
      ),
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-800 flex justify-center items-center p-6">
      <div className="relative w-full max-w-6xl grid grid-cols-12 gap-2 bg-gray-900 p-4 rounded-lg">
        {/* Exit */}
        <div className="col-span-12 text-center text-red-500 font-bold mb-4">
          EXIT
        </div>

        {/* Parkeringsplasser */}
        <div className="col-span-5 grid grid-cols-2 gap-4">
          {parkingSpots.map((spot) => (
            <div
              key={spot.id}
              className={`h-20 flex justify-center items-center text-white font-bold cursor-pointer rounded ${
                spot.isOccupied ? "bg-red-600" : "bg-green-600"
              }`}
              onClick={() => toggleSpot(spot.id)}
            >
              Parkering {spot.spotNumber}
            </div>
          ))}
        </div>

        {/* Kjørefelt */}
        <div className="col-span-2 flex items-center justify-center bg-gray-800" />

        {/* Inngang */}
        <div className="col-span-5 flex flex-col justify-center items-center">
          <div className="h-40 w-full bg-gray-700 flex items-center justify-center text-white font-bold text-center rounded">
            TRAPP
          </div>
        </div>
      </div>
    </div>
  );
}
