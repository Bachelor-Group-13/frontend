"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Mail, Phone } from "lucide-react";

type ParkingSpot = {
  id: number;
  spotNumber: string;
  isOccupied: boolean;
  occupiedBy: {
    license_plate: string | null;
    email: string | null;
    phone_number: string | null;
  } | null;
};

export default function GarageLayout() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([
    { id: 1, spotNumber: "1A", isOccupied: false, occupiedBy: null },
    { id: 2, spotNumber: "1B", isOccupied: false, occupiedBy: null },
    { id: 3, spotNumber: "2A", isOccupied: false, occupiedBy: null },
    { id: 4, spotNumber: "2B", isOccupied: false, occupiedBy: null },
    { id: 5, spotNumber: "3A", isOccupied: false, occupiedBy: null },
    { id: 6, spotNumber: "3B", isOccupied: false, occupiedBy: null },
    { id: 7, spotNumber: "4A", isOccupied: false, occupiedBy: null },
    { id: 8, spotNumber: "4B", isOccupied: false, occupiedBy: null },
    { id: 9, spotNumber: "5A", isOccupied: false, occupiedBy: null },
    { id: 10, spotNumber: "5B", isOccupied: false, occupiedBy: null },
    { id: 11, spotNumber: "6A", isOccupied: false, occupiedBy: null },
    { id: 12, spotNumber: "6B", isOccupied: false, occupiedBy: null },
    { id: 13, spotNumber: "7A", isOccupied: false, occupiedBy: null },
    { id: 14, spotNumber: "7B", isOccupied: false, occupiedBy: null },
  ]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: userDetails } = await supabase
          .from("users")
          .select("license_plate, email, phone_number")
          .eq("id", userData.user.id)
          .single();

        if (userDetails) {
          setUser(userDetails);
        }
      }
    };

    fetchUser();
  }, []);

  const toggleSpot = (id: number) => {
    setParkingSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.id === id
          ? {
              ...spot,
              isOccupied: !spot.isOccupied,
              occupiedBy: !spot.isOccupied ? user : null,
            }
          : spot,
      ),
    );
  };

  return (
    <div className="grid grid-cols-12 gap-2 bg-gray-50 p-4 rounded-lg">
      {/* Utgang */}
      <div className="col-span-12 text-center mb-4">
        <h1
          className="text-xl font-bold text-red-600"
          style={{ marginLeft: "17%" }}
        >
          UTGANG
        </h1>
      </div>

      {/* Parkeringsplasser */}
      <div className="col-span-6 grid grid-cols-2 gap-4">
        {parkingSpots.map((spot) => (
          <div
            key={spot.id}
            className={`h-24 flex flex-col justify-center items-center text-white font-bold cursor-pointer rounded ${
              spot.isOccupied ? "bg-red-600" : "bg-green-600"
            }`}
            onClick={() => toggleSpot(spot.id)}
          >
            <div>{spot.spotNumber}</div>
            {spot.isOccupied && spot.occupiedBy && (
              <div className="text-sm mt-2 space-y-1 text-center">
                <p className="font-semibold">
                  Skiltnr: {spot.occupiedBy.license_plate}
                </p>
                <div className="flex justify-center space-x-2">
                  <a
                    href={`mailto:${spot.occupiedBy.email}`}
                    className="flex items-center justify-center w-8 h-8 bg-transparent text-white rounded-full hover:bg-blue-600 transition"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${spot.occupiedBy.phone_number}`}
                    className="flex items-center justify-center w-8 h-8 bg-transparent text-white rounded-full hover:bg-green-600 transition"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Kjørefelt */}
      <div className="col-span-2 flex items-center justify-center bg-gray-200">
        <p className="text-gray-800 font-bold rotate-90">Kjørefelt</p>
      </div>

      {/* Trapp / Inngang */}
      <div className="col-span-4 flex items-center justify-center ml-6">
        <div className="h-40 w-full bg-gray-800 text-white font-bold flex items-center justify-center rounded">
          TRAPP
        </div>
      </div>
    </div>
  );
}
