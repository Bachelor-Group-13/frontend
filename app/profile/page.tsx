"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
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
import { api } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/AuthContext";
import ProfileCard from "@/components/profile/ProfileCard";
import VehicleSettings from "@/components/profile/VehicleSettings";
import ContactSettings from "@/components/profile/ContactSettings";
import SecuritySettings from "@/components/profile/SecuritySettings";
import { handleLicensePlateChange } from "@/lib/utils/plate-helpers";

/*
 * ProfilePage:
 *
 * User interface for users to update their profile
 * including license plate, phone number, and password.
 * It fetches the users current information form Supabase and allows them
 * to update it
 */
export default function ProfilePage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [secondLicensePlate, setSecondLicensePlate] = useState("");
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showPasswordMismatchAlert, setShowPasswordMismatchAlert] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [licensePlateError, setLicensePlateError] = useState<string | null>(
    null
  );
  const [showSecondLicensePlate, setShowSecondLicensePlate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handlePrimaryLicensePlateChange = useCallback(
    (value: string) => {
      setLicensePlate(value);
      handleLicensePlateChange(
        { target: { value } } as React.ChangeEvent<HTMLInputElement>,
        () => {},
        setLicensePlateError
      );
    },
    [setLicensePlate, setLicensePlateError]
  );

  const handleSecondLicensePlateChange = useCallback(
    (value: string) => {
      setSecondLicensePlate(value);
    },
    [setSecondLicensePlate]
  );

  const handlePhoneNumberChange = useCallback(
    (value: string) => {
      setPhoneNumber(value);
    },
    [setPhoneNumber]
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
    },
    [setPassword]
  );

  const handleConfirmPasswordChange = useCallback(
    (value: string) => {
      setConfirmPassword(value);
    },
    [setConfirmPassword]
  );

  const handleShowSecondLicensePlate = useCallback(() => {
    setShowSecondLicensePlate(true);
  }, [setShowSecondLicensePlate]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated || !user) {
        router.push("/auth");
        return;
      }

      try {
        const response = await api.get(`/api/auth/${user.id}`);
        const userData = response.data;

        setLicensePlate(userData.licensePlate || "");
        setSecondLicensePlate(userData.secondLicensePlate || "");
        setPhoneNumber(userData.phoneNumber || "");
        setUserEmail(userData.email || "");
        setName(userData.name || "");

        if (userData.secondLicensePlate) {
          setShowSecondLicensePlate(true);
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        setErrorMessage(
          error.response?.data?.message || "Failed to fetch user data"
        );
        setShowErrorAlert(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [user, isAuthenticated, router]);

  /*
   * handleUpdate function:
   *
   * Handles the update of user profile. It validates
   * the input fields and interacts with supabase to update the users
   * information.
   */
  const handleUpdate = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (password && password !== confirmPassword) {
        setShowPasswordMismatchAlert(true);
        setIsSubmitting(false);
        return;
      }

      if (!user?.id) {
        throw new Error("User ID not found");
      }

      if (!licensePlate) {
        setLicensePlateError("Primary license plate is required.");
        setIsSubmitting(false);
        return;
      }
      handleLicensePlateChange(
        {
          target: { value: licensePlate },
        } as React.ChangeEvent<HTMLInputElement>,
        () => {},
        setLicensePlateError
      );

      if (licensePlateError !== null) {
        setIsSubmitting(false);
        return;
      }

      if (
        phoneNumber &&
        (phoneNumber.length !== 8 || !/^\d+$/.test(phoneNumber))
      ) {
        setErrorMessage("Invalid phone number format. It should be 8 digits.");
        setShowErrorAlert(true);
        setIsSubmitting(false);
        return;
      }

      if (password && password.length < 6) {
        setErrorMessage("New password must be at least 6 characters long.");
        setShowErrorAlert(true);
        setIsSubmitting(false);
        return;
      }

      const updateData: any = {};

      updateData.licensePlate = licensePlate.toUpperCase();

      if (secondLicensePlate !== "" || showSecondLicensePlate) {
        updateData.secondLicensePlate = secondLicensePlate
          ? secondLicensePlate.toUpperCase()
          : null;
      } else {
        updateData.secondLicensePlate = null;
      }

      updateData.phoneNumber = phoneNumber || null;

      if (password) {
        updateData.password = password;
      }

      await api.put(`/api/auth/${user.id}`, updateData);

      setShowSuccessAlert(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "An unknown error occurred during update."
      );
      setShowErrorAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200
              border-t-neutral-900"
          ></div>
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (showErrorAlert && errorMessage.includes("Failed to fetch user data")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Error Loading Profile
              </AlertDialogTitle>
              <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => router.push("/garage")}
                className="bg-neutral-900 hover:bg-neutral-800"
              >
                Go to Garage
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/garage"
            className="rounded-full p-2 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="w-5" />
        </div>

        <div className="mx-auto max-w-2xl">
          <ProfileCard
            name={name}
            email={userEmail}
            onUpdate={handleUpdate}
            isSubmitting={isSubmitting}
            licensePlateError={licensePlateError}
          >
            <VehicleSettings
              primaryLicensePlate={licensePlate}
              onPrimaryLicensePlateChange={handlePrimaryLicensePlateChange}
              secondLicensePlate={secondLicensePlate}
              onSecondLicensePlateChange={handleSecondLicensePlateChange}
              licensePlateError={licensePlateError}
              showSecondLicensePlate={showSecondLicensePlate}
              onShowSecondLicensePlate={handleShowSecondLicensePlate}
            />
            <ContactSettings
              phoneNumber={phoneNumber}
              onPhoneNumberChange={handlePhoneNumberChange}
            />
            <SecuritySettings
              password={password}
              onPasswordChange={handlePasswordChange}
              confirmPassword={confirmPassword}
              onConfirmPasswordChange={handleConfirmPasswordChange}
            />
          </ProfileCard>
        </div>
      </div>

      {/* Success Alert Dialog */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Profile Updated
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your profile has been successfully updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessAlert(false);
                router.push("/garage");
              }}
              className="bg-neutral-900 hover:bg-neutral-800"
            >
              Back to Garage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Alert Dialog (excluding fetch errors) */}
      <AlertDialog
        open={
          showErrorAlert && !errorMessage.includes("Failed to fetch user data")
        }
        onOpenChange={setShowErrorAlert}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Error
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowErrorAlert(false)}
              className="bg-neutral-900 hover:bg-neutral-800"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Mismatch Alert Dialog */}
      <AlertDialog
        open={showPasswordMismatchAlert}
        onOpenChange={setShowPasswordMismatchAlert}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Password Mismatch
            </AlertDialogTitle>
            <AlertDialogDescription>
              Passwords do not match. Please try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowPasswordMismatchAlert(false)}
              className="bg-neutral-900 hover:bg-neutral-800"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
