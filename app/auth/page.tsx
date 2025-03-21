"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { handleLicensePlateChange } from "@/utils/helpers";
import axios from "axios";
import { signIn } from "next-auth/react";

/**
 * Auth Page:
 * This page allows users to either sign in or sign up.
 * It includes integration with Supabase for user authentication.
 */
export default function AuthPage() {
  // State variables
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alert, setAlert] = useState<{
    type: "default" | "destructive";
    title: string;
    description: string;
  } | null>(null);
  const [licensePlateError, setLicensePlateError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/garage";

  /*
   * handleSubmit function:
   * Handles form submission for both sign in and sign up.
   * Validates the input fields, interacts with supabase and
   * manages user sessions.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        // Sign up logic
        // Checks if all required fields are filled
        if (!email || !password || !licensePlate || !phoneNumber) {
          setAlert({
            type: "destructive",
            title: "Missing Fields",
            description: "All fields are required for sign-up.",
          });
          setIsLoading(false);
          return;
        }

        // Checks if the password meets the minimum length requirement
        if (password.length < 6) {
          setAlert({
            type: "destructive",
            title: "Invalid Password",
            description: "Password must be at least 6 characters long.",
          });
          setIsLoading(false);
          return;
        }

        const response = await axios.post("/api/auth/register", {
          email,
          password,
          licensePlate: licensePlate.toUpperCase(),
          phoneNumber,
        });

        setAlert({
          type: "default",
          title: "Success",
          description: "Account created successfully. Please sign in.",
        });
      } else {
        // Sign in logic
        // Checks if the required fields are filled
        if (!email || !password) {
          setAlert({
            type: "destructive",
            title: "Missing Fields",
            description: "Email and password are required for sign-in.",
          });
          setIsLoading(false);
          return;
        }

        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        });

        if (result?.error) {
          setAlert({
            type: "destructive",
            title: "Sign In Failed",
            description: "Invalid email or password. Please try again.",
          });
          setIsLoading(false);
          return;
        }

        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: any) {
      // Handles unexpected errors during sign in process
      setAlert({
        type: "destructive",
        title: "Error",
        description:
          error.response?.data?.error || error.message || "An error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="text-2xl font-bold">Inneparkert</CardTitle>
            <div />
          </div>
          <p className="text-gray-600">
            {isSignUp
              ? "Create a new account to get started."
              : "Sign in to access your account."}
          </p>
        </CardHeader>
        <CardContent>
          {alert && (
            <div className="mb-4">
              <Alert variant={alert.type}>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            </div>
          )}
          <Tabs
            defaultValue="signin"
            onValueChange={(value) => setIsSignUp(value === "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
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
                  <Button type="submit" className="w-full bg-gray-800">
                    Sign In
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
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
                    <Label>License Plate</Label>
                    <Input
                      type="text"
                      value={licensePlate}
                      onChange={handleLicensePlateInputChange}
                      placeholder="Your car's license plate"
                      required
                      minLength={7}
                      maxLength={7}
                      autoCapitalize="characters"
                      className={licensePlateError ? "border-red-500" : ""}
                    />
                    {licensePlateError && (
                      <p className="text-red-500 text-sm">
                        {licensePlateError}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number </Label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Your phone number"
                      required
                      maxLength={8}
                      minLength={8}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gray-800"
                    disabled={licensePlateError !== null}
                  >
                    Sign Up
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
