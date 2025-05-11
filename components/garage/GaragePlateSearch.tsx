import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

/**
 * Props for the GaragePlateSearch component.
 * @param onSearch - Function to handle the search when a valid plate is entered
 */
export interface GaragePlateSearchProps {
  onSearch: (plate: string) => void;
}

/**
 * A component for searching license plates.
 *
 * Includes a styled input with validation for plate format.
 * @param {GaragePlateSearchProps} props - The props for the GaragePlateSearch component
 */
export function GaragePlateSearch({ onSearch }: GaragePlateSearchProps) {
  const [plate, setPlate] = useState("");

  return (
    <div className="max-w-xs">
      {/* License plate input field */}
      <div
        className="flex h-12 overflow-hidden rounded-md border-2 transition
          focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500"
        tabIndex={-1}
      >
        <div
          className="flex flex-col items-center justify-center bg-[#003DA7]"
          style={{ minWidth: 48 }}
        >
          <img
            src="/svg/flag-icon.svg"
            alt="Norway"
            className="mt-1 h-3 w-auto"
          />
          <span className="text-md items-center justify-center font-medium text-white">
            N
          </span>
        </div>

        {/* License plate input field */}
        <Input
          type="text"
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder="AB12345"
          maxLength={7}
          minLength={7}
          pattern="[A-Z]{2}[0-9]{5}"
          title="Must be this format: AB12345"
          className="h-full flex-1 border-0 text-center !text-2xl tracking-wider shadow-none
            placeholder:!text-2xl focus:border-transparent focus:outline-none focus:ring-0
            focus-visible:border-transparent focus-visible:ring-0"
        />

        {/* Search button */}
        <Button
          onClick={() => {
            const trimmed = plate.trim().toUpperCase();
            if (trimmed) onSearch(trimmed);
          }}
          variant="ghost"
          className="mt-1 p-3 hover:bg-transparent"
          disabled={!plate.trim()}
        >
          <ArrowRight className="h-10 w-auto" />
        </Button>
      </div>
    </div>
  );
}
