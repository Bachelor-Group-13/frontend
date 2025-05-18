"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

/**
 * Props for the SecuritySettings component.
 * @param password - The new password value
 * @param onPasswordChangeAction - Function to handle password changes
 * @param confirmPassword - The password confirmation value
 * @param onConfirmPasswordChangeAction - Function to handle confirm password changes
 */
interface SecuritySettingsProps {
  password: string;
  onPasswordChangeAction: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChangeAction: (value: string) => void;
}

/**
 * A component that provides a form for updating user password.
 *
 * Includes password visibility toggle and confirmation field
 */
export default function SecuritySettings({
  password,
  onPasswordChangeAction,
  confirmPassword,
  onConfirmPasswordChangeAction,
}: SecuritySettingsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Header */}
      <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
        <Lock className="h-5 w-5 text-gray-500" />
        Security
      </h3>

      {/* Password form */}
      <div className="space-y-4">
        {/* New password input */}
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-sm">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChangeAction(e.target.value)}
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

        {/* Confirm password input */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChangeAction(e.target.value)}
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
            {`Leave blank if you don't want to change your password`}
          </p>
        </div>
      </div>
    </div>
  );
}
