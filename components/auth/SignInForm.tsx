"use client";

import { login } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "../ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface SignInFormProps {
  onSuccessAction: () => void;
  onErrorAction: (
    type: "default" | "destructive",
    title: string,
    description: string
  ) => void;
}

export default function SignInForm({
  onSuccessAction,
  onErrorAction,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !password) {
      onErrorAction(
        "destructive",
        "Missing Fields",
        "Email and password are required."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await login(email, password);

      if (error) {
        onErrorAction("destructive", "Sign In Failed", error.message);
        setIsSubmitting(false);
        return;
      }

      onSuccessAction();
      router.push("/garage");
    } catch (error: any) {
      onErrorAction(
        "destructive",
        "Error",
        error.message || "An unknown error occured."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            className="mb-3 pl-10"
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
        disabled={isSubmitting}
        className="mt-6 w-full bg-neutral-900 py-5 hover:bg-neutral-800"
      >
        {isSubmitting ? (
          <>
            <span
              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white
                border-t-transparent"
            />
            <span className="text-white">Signing in...</span>
          </>
        ) : (
          <span className="text-white">Sign in</span>
        )}
      </Button>
    </form>
  );
}
