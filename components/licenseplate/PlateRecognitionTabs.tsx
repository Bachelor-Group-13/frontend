"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../auth/AuthContext";
import { Search } from "lucide-react";
import { Camera } from "lucide-react";
import { Upload } from "lucide-react";

/**
 * Props for the PlateRecognitionTabs component.
 * @param activeTab - The currently selected tab
 * @param onTabChangeAction - Function to handle tab changes
 */
interface PlateRecognitionTabsProps {
  activeTab: string;
  onTabChangeAction: (value: string) => void;
}

/**
 * A component that provides tabs for different license plate recognition methods.
 *
 * Shows different tabs based on user role:
 * - All users: Manual search and camera options
 * - Developers: Additional upload image option
 */
export function PlateRecognitionTabs({
  activeTab,
  onTabChangeAction,
}: PlateRecognitionTabsProps) {
  const { user } = useAuth();
  return (
    <Tabs
      defaultValue="manual"
      value={activeTab}
      onValueChange={onTabChangeAction}
      className="w-full"
    >
      {/* Tabs container */}
      <div className="border-b px-6 py-4">
        <TabsList
          className={`grid w-full ${
            user && user?.role === "ROLE_DEVELOPER"
              ? "grid-cols-3"
              : "grid-cols-2"
            }`}
        >
          {/* Manual search tab */}
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          {/* Camera tab */}
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Camera
          </TabsTrigger>
          {/* Upload tab (developer only) */}
          {user && user?.role === "ROLE_DEVELOPER" && (
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          )}
        </TabsList>
      </div>
    </Tabs>
  );
}
