import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../auth/AuthContext";

/**
 * A hero section component for the landing page.
 */
export function HeroSection() {
  const { user } = useAuth();
  const buttonText = user ? "Go to Garage" : "Get Started";
  const buttonLink = user ? "/garage" : "/auth";

  return (
    <section className="relative overflow-hidden bg-neutral-900 py-20 text-white">
      {/* Background image with opacity */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Image
          src="/parking-lot3.png"
          alt="Background"
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
        />
      </div>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10 bg-gradient-to-r from-neutral-900 via-neutral-900/95
          to-neutral-900/80"
      ></div>

      {/* Main content */}
      <div className="container relative z-20 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Inneparkert
          </h1>
          <Link href={buttonLink}>
            <Button
              size="lg"
              className="gap-2 bg-white px-8 text-neutral-900 hover:bg-gray-100"
            >
              {buttonText} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
