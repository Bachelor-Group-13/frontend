import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const buttonText = session ? "Go to Garage" : "Get Started";

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50
      to-slate-100"
    >
      {/* Hero Section */}
      <section
        className="container mx-auto px-4 py-16 md:py-24 flex flex-col
        md:flex-row items-center gap-8 md:gap-16"
      >
        <div className="flex-1 space-y-6">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight
            text-slate-900"
          >
            Never get parked in again
          </h1>
          <p className="text-xl text-slate-600 max-w-md">
            Manage parking spaces, report blocked vehicles, and coordinate with
            colleagues—all in one place.
          </p>
          <div className="flex gap-4">
            <Link href={session ? "/garage" : "/auth"}>
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
          className="flex-1 relative h-[300px] md:h-[400px] w-full
          rounded-xl overflow-hidden shadow-xl"
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
