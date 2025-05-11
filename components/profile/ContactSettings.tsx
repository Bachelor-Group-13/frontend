"use client";

import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Phone } from "lucide-react";

/**
 * Props for the ContactSettings component.
 * @param phoneNumber - The current phone number value
 * @param onPhoneNumberChangeAction - Function to handle phone number changes
 */
interface ContactSettingsProps {
  phoneNumber: string;
  onPhoneNumberChangeAction: (value: string) => void;
}

/**
 * A component that provides a form for managing user contact information.
 *
 * Allows users to update their phone number with validation
 * and proper formatting.
 */
export default function ContactSettings({
  phoneNumber,
  onPhoneNumberChangeAction,
}: ContactSettingsProps) {
  return (
    <div>
      {/* Header */}
      <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
        <Phone className="h-5 w-5 text-gray-500" />
        Contact Information
      </h3>

      {/* Phone number input */}
      <div className="space-y-2">
        <Label htmlFor="phone-number" className="text-sm">
          Phone Number
        </Label>

        <Input
          id="phone-number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChangeAction(e.target.value)}
          placeholder="Your phone number"
          maxLength={8}
        />
      </div>
      <Separator className="mt-6" />
    </div>
  );
}
