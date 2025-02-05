"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/utils/supabase/client";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alert, setAlert] = useState<{
    type: "default" | "destructive";
    title: string;
    description: string;
  } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      if (!email || !password || !licensePlate || !phoneNumber) {
        setAlert({
          type: "destructive",
          title: "Missing Fields",
          description: "All fields are required for sign-up.",
        });
        return;
      }

      if (password.length < 6) {
        setAlert({
          type: "destructive",
          title: "Invalid Password",
          description: "Password must be at least 6 characters long.",
        });
        return;
      }

      try {
        console.log("Sign up flow triggered");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setAlert({
            type: "destructive",
            title: "Sign Up Failed",
            description: error.message,
          });
          return;
        }

        if (data.user) {
          const { error: dbError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              email,
              license_plate: licensePlate,
              phone_number: phoneNumber,
            },
          ]);

          if (dbError) {
            setAlert({
              type: "destructive",
              title: "Database Error",
              description: dbError.message,
            });
            return;
          }

          setAlert({
            type: "default",
            title: "Success",
            description: "Account created successfully. Please sign in.",
          });
          setIsSignUp(false);
        }
      } catch (error: any) {
        setAlert({
          type: "destructive",
          title: "Error",
          description: error.message || "An unknown error occurred.",
        });
      }
    } else {
      if (!email || !password) {
        setAlert({
          type: "destructive",
          title: "Missing Fields",
          description: "Email and password are required for sign-in.",
        });
        return;
      }

      try {
        console.log("Sign in flow triggered");
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAlert({
            type: "destructive",
            title: "Sign In Failed",
            description: error.message,
          });
          return;
        }

        const { data: session } = await supabase.auth.getSession();
        if (session) {
          router.push("/garage");
        } else {
          throw new Error("Session not established");
        }
      } catch (error: any) {
        setAlert({
          type: "destructive",
          title: "Error",
          description: error.message || "An unknown error occurred.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Inneparkert</CardTitle>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <p className="text-gray-600">
            {isSignUp
              ? "Create a new account to get started."
              : "Sign in to access your account."}
          </p>
        </CardHeader>
        <CardContent>
          {alert && (
            <div className="mb-4">
              <Alert variant={alert.type}>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            </div>
          )}
          <Tabs
            defaultValue="signin"
            onValueChange={(value) => setIsSignUp(value === "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gray-800">
                    Sign In
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>License Plate</Label>
                    <Input
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="Your car's license plate"
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone Number </Label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Your phone number"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gray-800">
                    Sign Up
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
