"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  Mail,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { handleLicensePlateChange } from "@/lib/utils/helpers";
import { login, register } from "@/lib/api/auth";

/**
 * Auth Page:
 * This page allows users to either sign in or sign up.
 * It handles user authentication and session management.
 */
export default function AuthPage() {
  // State variables
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "default" | "destructive";
    title: string;
    description: string;
  } | null>(null);
  const [licensePlateError, setLicensePlateError] = useState<string | null>(
    null
  );
  const router = useRouter();

  /*
   * handleSubmit function:
   * Handles form submission for both sign in and sign up.
   * Validates the input fields, and triggers the appropriate action.
   * @param e: React.FormEvent - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isSignUp) {
      // Sign up logic
      // Checks if all required fields are filled
      if (!email || !name || !password || !licensePlate || !phoneNumber) {
        setAlert({
          type: "destructive",
          title: "Missing Fields",
          description: "All fields are required for sign-up.",
        });
        setIsSubmitting(false);
        return;
      }

      // Checks if the password meets the minimum length requirement
      if (password.length < 6) {
        setAlert({
          type: "destructive",
          title: "Invalid Password",
          description: "Password must be at least 6 characters long.",
        });
        setIsSubmitting(false);
        return;
      }

      try {
        console.log("Sign up flow triggered");
        // Register the user
        const { data, error } = await register(
          name,
          email,
          password,
          licensePlate.toUpperCase(),
          phoneNumber
        );

        console.log("Sign up data:", data);
        // Handles sign up errors
        if (error) {
          setAlert({
            type: "destructive",
            title: "Sign Up Failed",
            description: error.message,
          });

          setIsSubmitting(false);
          return;
        }

        // Success message and switches to sign in tab
        setAlert({
          type: "default",
          title: "Success",
          description: "Account created successfully. Please sign in.",
        });
        setIsSignUp(false);
      } catch (error: any) {
        setAlert({
          type: "destructive",
          title: "Error",
          description: error.message || "An unknown error occurred.",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign in logic
      // Checks if the required fields are filled
      if (!email || !password) {
        setAlert({
          type: "destructive",
          title: "Missing Fields",
          description: "Email and password are required for sign-in.",
        });
        setIsSubmitting(false);
        return;
      }

      try {
        console.log("Sign in flow triggered");
        // Sign in the user
        const { data, error } = await login(email, password);

        console.log("Sign in data:", data);
        // Handles errors during sign in
        if (error) {
          setAlert({
            type: "destructive",
            title: "Sign In Failed",
            description: error.message,
          });
          setIsSubmitting(false);
          return;
        }
        router.push("/garage");
      } catch (error: any) {
        // Handles unexpected errors during sign in process
        setAlert({
          type: "destructive",
          title: "Error",
          description: error.message || "An unknown error occurred.",
        });
        setIsSubmitting(false);
      }
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <Card className="mx-auto w-full max-w-md overflow-hidden shadow-lg">
          <CardHeader className="pb-6">
            <div className="mb-2 flex items-center justify-between">
              <Link
                href="/"
                className="rounded-full p-1 transition-colors hover:bg-gray-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold">
                  Inneparkert
                </CardTitle>
              </div>
              <div className="w-5" />
            </div>
            <CardDescription className="text-center text-gray-600">
              {isSignUp
                ? "Create a new account to get started."
                : "Sign in to access your account."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {alert && (
              <Alert
                variant={alert.type}
                className={`mb-6 ${alert.type === "default" ? "border-green-200 bg-green-50" : ""}`}
              >
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            )}
            <Tabs
              defaultValue="signin"
              value={isSignUp ? "signup" : "signin"}
              onValueChange={(value) => setIsSignUp(value === "signup")}
              className="w-full"
            >
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-6 w-full bg-neutral-900 py-5 hover:bg-neutral-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white
                            border-t-transparent"
                        ></span>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-sm font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ola Nordmann"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password (min. 6 characters)"
                        className="pl-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800"
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
                    <Label
                      htmlFor="license-plate"
                      className="text-sm font-medium"
                    >
                      License Plate
                    </Label>
                    <div className="relative">
                      <Car className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="license-plate"
                        type="text"
                        value={licensePlate}
                        onChange={handleLicensePlateInputChange}
                        placeholder="AB12345"
                        className={`pl-10 ${licensePlateError ? "border-red-500" : ""}`}
                        required
                        minLength={7}
                        maxLength={7}
                        autoCapitalize="characters"
                      />
                    </div>
                    {licensePlateError && (
                      <p className="text-xs text-red-500">
                        {licensePlateError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="12345678"
                        className="pl-10"
                        required
                        maxLength={8}
                        minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-6 w-full bg-neutral-900 py-5 hover:bg-neutral-800"
                    disabled={isSubmitting || licensePlateError !== null}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white
                            border-t-transparent"
                        ></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
