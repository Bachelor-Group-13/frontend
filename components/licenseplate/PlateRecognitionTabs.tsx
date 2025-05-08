"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../auth/AuthContext";
import { Search } from "lucide-react";
import { Camera } from "lucide-react";
import { Upload } from "lucide-react";

interface PlateRecognitionTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function PlateRecognitionTabs({
  activeTab,
  onTabChange,
}: PlateRecognitionTabsProps) {
  const { user } = useAuth();
  return (
    <Tabs
      defaultValue="manual"
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <div className="border-b px-6 py-4">
        <TabsList
          className={`grid w-full ${
            user && user?.role === "ROLE_DEVELOPER"
              ? "grid-cols-3"
              : "grid-cols-2"
            }`}
        >
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search License Plate
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Use Camera
          </TabsTrigger>
          {user && user?.role === "ROLE_DEVELOPER" && (
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </TabsTrigger>
          )}
        </TabsList>
      </div>
    </Tabs>
  );
}
