"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car } from "lucide-react";
import { useAuth } from "@/components/auth-context";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const buttonText = user ? "Go to Garage" : "Get Started";
  const buttonLink = user ? "/garage" : "/auth";

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-neutral-900 py-20 text-white">
          <div className="absolute inset-0 z-0 opacity-20">
            <Image
              src="/parking-lot3.jpg"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div
            className="absolute inset-0 z-10 bg-gradient-to-r from-neutral-900 via-neutral-900/95
              to-neutral-900/80"
          ></div>

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

        {/* How to Use section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-center gap-12 md:grid-cols-2">
                {/* Image */}
                <div className="relative h-[400px] overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src="/parking-lot3.jpg"
                    alt="Parking garage illustration"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Instructions */}
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Get Started with Inneparkert
                  </h2>

                  <p className="text-lg text-gray-600">
                    Inneparkert is an internal-use application designed to help
                    you manage parking more efficiently.
                  </p>

                  <div className="space-y-4">
                    {[1, 2, 3].map((step, i) => (
                      <div className="flex items-start gap-3" key={i}>
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900
                            text-white"
                        >
                          {step}
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {
                              [
                                "Create Your Account",
                                "Register Your Vehicle",
                                "Start Using the App",
                              ][i]
                            }
                          </h4>
                          <p className="text-gray-600">
                            {
                              [
                                'Press "Get Started" to create your account',
                                "Enter your information and license plate",
                                "Log in with your new account and start using the app",
                              ][i]
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link href={buttonLink}>
                      <Button
                        size="lg"
                        className="gap-2 bg-neutral-900 hover:bg-neutral-800"
                      >
                        {buttonText} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="mt-auto bg-white py-12">
        <div className="container mx-auto px-4">
          <div
            className="flex flex-col items-center justify-between gap-6 border-t border-gray-200 pt-8
              md:flex-row"
          >
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-neutral-900" />
              <span className="font-mono text-xl font-bold">Inneparkert</span>
            </div>

            <div className="text-center text-sm text-gray-600 md:text-right">
              <p className="mb-1">
                This app is intended for employees and registered users only.
              </p>
              <p>
                By signing in, you agree to share your registered information
                with Inneparkert and its users.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
