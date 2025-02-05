"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
      }

      if (userData?.user) {
        setUserId(userData.user.id);

        const { data: userDetails, error: detailsError } = await supabase
          .from("users")
          .select("license_plate")
          .eq("id", userData.user.id)
          .single();

        if (detailsError) {
          console.error("Error fetching user details:", detailsError.message);
          return;
        }

        if (userDetails?.license_plate) {
          setLicensePlate(userDetails.license_plate);
        }
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    try {
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password,
        });
        if (passwordError) {
          throw new Error(passwordError.message);
        }
      }

      if (userId) {
        const { error: dbError } = await supabase
          .from("users")
          .update({ license_plate: licensePlate })
          .eq("id", userId);

        if (dbError) {
          throw new Error(dbError.message);
        }
      }

      alert("Profile updated successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="max-w-xl w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">User Settings</h1>
        <div className="space-y-4">
          <div>
            <Label>License Plate</Label>
            <Input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder={licensePlate || "Your car's license plate"}
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <Button onClick={handleUpdate} className="w-full bg-gray-800">
            Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
