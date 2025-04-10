"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Plus,
} from "lucide-react";
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
import { handleLicensePlateChange } from "@/utils/helpers";
import { api } from "@/utils/auth";
import { useAuth } from "@/components/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/*
 * SettingsPage:
 *
 * User interface for users to update their profile
 * including license plate, phone number, and password.
 * It fetches the users current information form Supabase and allows them
 * to update it
 */
export default function ProfilePage() {
  // State variables using useState hook
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [secondLicensePlate, setSecondLicensePlate] = useState("");
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // useEffect hook to fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);

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

  /**
   * handleLicensePlateChange function:
   *
   * Updates the license plate state with the value from the input field.
   */
  const handleLicensePlateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleLicensePlateChange(e, setLicensePlate, setLicensePlateError);
  };

  /**
   * handleSecondLicensePlateChange function:
   *
   * Updates the second license plate state with the value from the input field.
   */
  const handleSecondLicensePlateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSecondLicensePlate(e.target.value);
  };

  /*
   * handleUpdate function:
   *
   * Handles the update of user profile. It validates
   * the input fields and interacts with supabase to update the users
   * information.
   */
  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      if (password && password !== confirmPassword) {
        setShowPasswordMismatchAlert(true);
        setIsSubmitting(false);
        return;
      }

      if (!user?.id) {
        throw new Error("User ID not found");
      }

      const updateData: any = {};

      if (licensePlate) {
        updateData.licensePlate = licensePlate.toUpperCase();
      }

      updateData.secondLicensePlate = secondLicensePlate
        ? secondLicensePlate.toUpperCase()
        : null;

      if (phoneNumber) {
        updateData.phoneNumber = phoneNumber;
      }

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
        error.response?.data?.message || "An unknown error occurred"
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
          <Card className="mb-6 overflow-hidden shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-xl
                    font-bold text-white"
                >
                  {name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </div>
                <div>
                  <CardTitle className="text-xl">{name}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {userEmail}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
                    <Car className="h-5 w-5 text-gray-500" />
                    Vehicle Information
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="license-plate" className="text-sm">
                        Primary License Plate
                      </Label>
                      <div className="relative">
                        <Input
                          id="license-plate"
                          type="text"
                          value={licensePlate}
                          onChange={handleLicensePlateInputChange}
                          placeholder="AB12345"
                          className={licensePlateError ? "border-red-500" : ""}
                          minLength={7}
                          maxLength={7}
                        />
                      </div>
                      {licensePlateError && (
                        <p className="text-xs text-red-500">
                          {licensePlateError}
                        </p>
                      )}
                    </div>

                    {!secondLicensePlate && !showSecondLicensePlate ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecondLicensePlate(true)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Add Second License Plate
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Label
                          htmlFor="second-license-plate"
                          className="text-sm"
                        >
                          Secondary License Plate
                        </Label>
                        <div className="relative">
                          <Input
                            id="second-license-plate"
                            type="text"
                            value={secondLicensePlate}
                            onChange={handleSecondLicensePlateInputChange}
                            placeholder="Second license plate"
                            minLength={7}
                            maxLength={7}
                          />
                          {secondLicensePlate && (
                            <Badge className="absolute right-2 top-2 bg-gray-500">
                              Secondary
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
                    <Phone className="h-5 w-5 text-gray-500" />
                    Contact Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="phone-number" className="text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Your phone number"
                      maxLength={8}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
                    <Lock className="h-5 w-5 text-gray-500" />
                    Security
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Leave blank if you don't want to change your password
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t bg-gray-50 p-6">
              <Button
                onClick={handleUpdate}
                className="bg-neutral-900 hover:bg-neutral-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white
                        border-t-transparent"
                    ></span>
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Success Alert Dialog */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
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

      {/* Error Alert Dialog */}
      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
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
              <AlertCircle className="h-5 w-5" />
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
