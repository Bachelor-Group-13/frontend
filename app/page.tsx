import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/utils/auth";

export default async function LandingPage() {
  const user = getCurrentUser();
  const buttonText = user ? "Go to Garage" : "Get Started";
  const buttonLink = user ? "/garage" : "/auth";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Main Content */}
      <main
        className="container mx-auto flex flex-col-reverse items-center justify-center gap-12 px-4
          py-20 md:flex-row md:items-start"
      >
        {/* Left: Instructions */}
        <section className="max-w-xl flex-1 space-y-6">
          <h2 className="text-3xl font-bold md:text-4xl">
            How to use Inneparkert
          </h2>

          <p className="font-medium text-slate-700">
            <strong>
              Inneparkert is an internal-use application designed to help you
              manage parking more efficiently.
            </strong>
          </p>

          <p className="text-slate-700">
            By registering your car’s license plate, you’ll receive a
            notification if your car is detected parked-in the company’s parking
            garage. You can also view an overview of available parking spaces in
            real time.
          </p>

          <div>
            <h3 className="font-semibold">Get Started in 3 easy steps:</h3>
            <ol className="list-inside list-decimal text-slate-700">
              <li>Press “Get Started” to create your account</li>
              <li>Enter your information and license plate</li>
              <li>Log in with your new account and start using the app</li>
            </ol>
          </div>

          <Link href={buttonLink}>
            <Button size="lg" className="mt-2 gap-2">
              {buttonText} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Right: Placeholder box for image or future content */}
        <div className="relative h-64 w-full flex-1 md:h-96 md:w-[400px]">
          <Image
            src="/parking-lot3.jpg"
            alt="Parking garage illustration"
            fill
            className="rounded-xl object-cover shadow-md"
            priority
          />
        </div>
      </main>

      <footer className="container mx-auto px-4 pb-12 text-sm text-slate-600">
        <h4 className="font-semibold">Who is this for?</h4>
        <p>
          This app is intended for employees and registered users only. <br />
          By signing in, you agree to share your registered information with
          Inneparkert and its users.
        </p>
      </footer>
    </div>
  );
}
