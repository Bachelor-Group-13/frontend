"use client";

import AuthCard from "@/components/auth/AuthCard";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

/**
 * Authentication page component.
 * Provides a tabbed interface for user sign-in and sign-up functionality.
 *
 * @returns The rendered authentication page
 */
export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [alert, setAlert] = useState<{
    type: "default" | "destructive";
    title: string;
    description: string;
  } | null>(null);

  /**
   * Handles displaying alerts for success or error messages.
   *
   * @param {"default" | "destructive"} type - The type of alert to display
   * @param {string} title - The alert title
   * @param {string} description - The alert description
   */
  const handleAlert = (
    type: "default" | "destructive",
    title: string,
    description: string
  ) => {
    setAlert({ type, title, description });
  };

  // Handles successful sign-up by showing a success message and switching to sign-in.
  const handleSignUpSuccess = () => {
    handleAlert(
      "default",
      "Success",
      "Account created successfully. Please sign in."
    );
    setIsSignUp(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto flex flex-1 items-center justify-center px-4">
        <AuthCard
          title="Inneparkert"
          description={
            isSignUp
              ? "Create a new account to get started."
              : "Sign in to access your account."
          }
        >
          {alert && (
            <Alert
              variant={alert.type}
              className={`mb-6 ${alert.type === "default" ? "border-green-200 bg-green-50" : ""}`}
            >
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          )}
          <Tabs
            defaultValue="signin"
            value={isSignUp ? "signup" : "signin"}
            onValueChange={(value) => {
              setIsSignUp(value === "signup");
              setAlert(null);
            }}
            className="w-full"
          >
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm
                onSuccessAction={() => setAlert(null)}
                onErrorAction={handleAlert}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm
                onSuccessAction={handleSignUpSuccess}
                onErrorAction={handleAlert}
                setIsSignUpAction={setIsSignUp}
              />
            </TabsContent>
          </Tabs>
        </AuthCard>
      </div>
    </div>
  );
}
