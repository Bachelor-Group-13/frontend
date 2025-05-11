import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export interface GaragePlateSearchProps {
  onSearch: (plate: string) => void;
}

export function GaragePlateSearch({ onSearch }: GaragePlateSearchProps) {
  const [plate, setPlate] = useState("");

  return (
    <div className="max-w-xs">
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
