"use client";

import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Phone } from "lucide-react";

interface ContactSettingsProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
}

export default function ContactSettings({
  phoneNumber,
  onPhoneNumberChange,
}: ContactSettingsProps) {
  return (
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
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder="Your phone number"
          maxLength={8}
        />
      </div>
      <Separator className="mt-6" />
    </div>
  );
}
