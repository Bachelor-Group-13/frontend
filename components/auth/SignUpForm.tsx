"use client";

import { login, register } from "@/lib/api/auth";
import { handleLicensePlateChange } from "@/lib/utils/plate-helpers";
import { useState } from "react";
import { Label } from "../ui/label";
import { Car, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface SignUpFormProps {
  onSuccessAction: () => void;
  onErrorAction: (
    type: "default" | "destructive",
    title: string,
    description: string
  ) => void;
  setIsSignUpAction: (value: boolean) => void;
}

export default function SignUpForm({
  onSuccessAction,
  onErrorAction,
  setIsSignUpAction,
}: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [licensePlateError, setLicensePlateError] = useState<string | null>(
    null
  );

  const handleLicensePlateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleLicensePlateChange(e, setLicensePlate, setLicensePlateError);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !name || !password || !licensePlate || !phoneNumber) {
      onErrorAction(
        "destructive",
        "Missing fields",
        "Please fill in all fields."
      );
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      onErrorAction(
        "destructive",
        "Weak password",
        "Password must be at least 6 characters long."
      );
      setIsSubmitting(false);
      return;
    }

    if (licensePlateError) {
      onErrorAction("destructive", "Invalid license plate", licensePlateError);
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await register(
        name,
        email,
        password,
        licensePlate.toUpperCase(),
        phoneNumber
      );

      if (error) {
        onErrorAction("destructive", "Sign Up Failed", error.message);
        setIsSubmitting(false);
        return;
      }

      // After successful registration, try to sign in
      const loginResult = await login(email, password);
      if (loginResult.error) {
        onErrorAction(
          "destructive",
          "Sign Up Successful",
          "Account created but automatic sign in failed. Please sign in manually."
        );
        setIsSignUpAction(false);
      } else {
        onSuccessAction();
      }
    } catch (error: any) {
      onErrorAction(
        "destructive",
        "Error",
        error.message || "An unknown error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="signup-email"
            type="email"
            value={email}
            placeholder="email@email.com"
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
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
        <Label htmlFor="signup-password" className="text-sm font-medium">
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
        <Label htmlFor="license-plate" className="text-sm font-medium">
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
          <p className="text-xs text-red-500">{licensePlateError}</p>
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
            className="mb-3 pl-10"
            required
            maxLength={8}
            minLength={8}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="mt-8 w-full bg-neutral-900 py-5 hover:bg-neutral-800"
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
  );
}
