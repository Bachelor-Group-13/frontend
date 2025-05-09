"use client";
import { useAuth } from "@/components/auth/AuthContext";
import { HeroSection } from "@/components/landingpage/Hero";
import { HowToUseSection } from "@/components/landingpage/HowToUse";
import { LandingPageFooter } from "@/components/landingpage/Footer";

export default function LandingPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />

        {/* How to Use section */}
        <HowToUseSection />
      </main>

      {/* Footer Section */}
      <LandingPageFooter />
    </div>
  );
}
