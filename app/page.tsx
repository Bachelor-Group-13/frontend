import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/utils/auth";

export default async function LandingPage() {
  const user = getCurrentUser();

  const buttonText = user ? "Go to Garage" : "Get Started";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section
        className="container mx-auto flex flex-col items-center gap-8 px-4 py-16 md:flex-row
          md:gap-16 md:py-24"
      >
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Never get parked in again
          </h1>
          <p className="max-w-md text-xl text-slate-600">
            Manage parking spaces, report blocked vehicles, and coordinate with
            colleagues—all in one place.
          </p>
          <div className="flex gap-4">
            <Link href={user ? "/garage" : "/auth"}>
              {" "}
              {/* Update Link */}
              <Button size="lg" className="gap-2">
                {buttonText} <ArrowRight className="h-4 w-4" />{" "}
                {/* Use dynamic text */}
              </Button>
            </Link>
          </div>
        </div>
        <div
          className="relative h-[300px] w-full flex-1 overflow-hidden rounded-xl shadow-xl
            md:h-[400px]"
        >
          <Image
            src="/parking-lot3.jpg"
            alt="Parking garage illustration"
            className="object-cover"
            fill
            priority
          />
        </div>
      </section>
    </div>
  );
}
