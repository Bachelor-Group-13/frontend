"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { logout } from "@/utils/auth";
import { useAuth } from "./auth-context";

/*
 * Navbar component:
 *
 * Navigation bar with user authentication features,
 * including sign out button and link to the settings page.
 * It fetches users information from supabase and displays
 * it in an avatar.
 */
export function Navbar() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  /*
   * handleSignOut function:
   *
   * Signs the user out of the application and redirects them to the
   * landing page
   *
   */
  const handleSignOut = () => {
    logout();
    setUser(null);
    router.push("/");
  };

  /*
   * getInitials function:
   *
   * Extracts the initials from the users email address.
   */
  const getInitials = () => {
    if (user?.name) {
      const nameParts = user.name.split(" ");
      const initials = nameParts
        .filter((part: any) => part.length > 0)
        .slice(0, 2)
        .map((part: any) => part.charAt(0).toUpperCase())
        .join("");
      return initials;
    } else if (user?.email) {
      const parts = user.email.split("@")[0].split(/[\W_]+/);
      const initials = parts
        .filter((part: any) => part.length > 0)
        .slice(0, 2)
        .map((part: any) => part.charAt(0).toUpperCase())
        .join("");
      return initials || "U";
    }
    return "U";
  };

  return (
    <nav className="bg-neutral-900 text-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-2xl font-bold"
        >
          <Car className="h-6 w-6" />
          Inneparkert
        </Link>

        {isLoading ? (
          <div>Loading...</div>
        ) : user ? (
          // Logged-in state
          <div className="flex items-center space-x-4">
            <p className="text-md">{user.name}</p>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user?.avatar_url || undefined}
                    alt="User Avatar"
                  />
                  <AvatarFallback className="text-gray-800">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer font-bold text-red-600 transition-colors hover:bg-red-600
                    hover:text-white focus:bg-red-600 focus:text-white"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // Logged-out state
          <Link href="/auth">
            <Button className="text-primary" variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
