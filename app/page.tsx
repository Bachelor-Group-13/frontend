"use client";
import { useAuth } from "@/components/auth/AuthContext";
import { HeroSection } from "@/components/landingpage/Hero";
import { HowToUseSection } from "@/components/landingpage/HowToUse";
import { LandingPageFooter } from "@/components/landingpage/Footer";

/**
 * The main landing page component.
 * Displays the application's hero section, how-to-use guide, and footer.
 *
 * @returns The rendered landing page
 */
export default function LandingPage() {
  const { isLoading } = useAuth();

  // Renders a loading spinner while authentication state is being determined.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
      </div>
    );
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
