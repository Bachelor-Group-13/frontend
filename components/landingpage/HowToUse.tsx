import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

/**
 * A section component that explains how to use the application.
 */
export function HowToUseSection() {
  const { user } = useAuth();
  const buttonText = user ? "Go to Garage" : "Get Started";
  const buttonLink = user ? "/garage" : "/auth";

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Image */}
            <div className="relative h-[400px] overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/parking-lot3.png"
                alt="Parking garage illustration"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Instructions */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Get Started with Inneparkert
              </h2>

              <p className="text-lg text-gray-600">
                Inneparkert is an internal-use application designed to help you
                manage parking more efficiently.
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
  );
}
