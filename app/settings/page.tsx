"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showPasswordMismatchAlert, setShowPasswordMismatchAlert] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        setErrorMessage(userError.message);
        setShowErrorAlert(true);
        return;
      }

      if (userData?.user) {
        setUserId(userData.user.id);

        const { data: userDetails, error: detailsError } = await supabase
          .from("users")
          .select("license_plate, phone_number")
          .eq("id", userData.user.id)
          .single();

        if (detailsError) {
          setErrorMessage(detailsError.message);
          setShowErrorAlert(true);
          return;
        }

        if (userDetails) {
          setLicensePlate(userDetails.license_plate || "");
          setPhoneNumber(userDetails.phone_number || "");
        }
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    try {
      if (password && password !== confirmPassword) {
        setShowPasswordMismatchAlert(true);
        return;
      }

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
          .update({ license_plate: licensePlate, phone_number: phoneNumber })
          .eq("id", userId);

        if (dbError) {
          throw new Error(dbError.message);
        }
      }

      setShowSuccessAlert(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      setShowErrorAlert(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="max-w-xl w-full bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <Link href="/garage">
            <ArrowLeft className="h-5 w-5 text-gray-800 cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold">User Settings</h1>
          <div />
        </div>

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
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={phoneNumber || "Your phone number"}
            />
          </div>
          <div>
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <Button onClick={handleUpdate} className="w-full bg-gray-800">
            Update Profile
          </Button>
        </div>
      </div>

      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Profile updated successfully
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessAlert(false);
                router.push("/garage");
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showPasswordMismatchAlert}
        onOpenChange={setShowPasswordMismatchAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Mismatch</AlertDialogTitle>
            <AlertDialogDescription>
              Passwords do not match. Please try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowPasswordMismatchAlert(false)}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
