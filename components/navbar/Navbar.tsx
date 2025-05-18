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
import { Car, ChevronDown, LogOut, User } from "lucide-react";
import { logout } from "@/lib/api/auth";
import { useAuth } from "../auth/AuthContext";
import { cn } from "@/lib/utils/utils";
import { NotificationToggle } from "../garage/NotificationToggle";

/**
 * A navigation bar component that provides user authentication and navigation.
 *
 * Handles user authentication state, displays user profile information,
 * and provides access to user settings and sign-out functionality.
 */
export function Navbar() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Signs the user out and redirects to the landing page
  const handleSignOut = () => {
    logout();
    setUser(null);
    router.push("/");
  };

  // Extracts initials from the user's name or email for avatar fallback
  const getInitials = (): string => {
    if (user?.name) {
      const nameParts = user.name.split(" ");
      const initials = nameParts
        .filter(part => part.length > 0)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");
      return initials;
    } else if (user?.email) {
      const localPart = user.email.split("@")[0];
      const parts = localPart.split(/[\W_]+/);
      const initials = parts
        .filter(part => part.length > 0)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");
      return initials || "U";
    }
    return "U";
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/90 text-gray-900 shadow-md backdrop-blur-md"
          : "bg-neutral-900 text-white"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and app name */}
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-xl font-bold transition-colors
            duration-200 hover:opacity-80 md:text-2xl"
        >
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg"
            )}
          >
            <Car className="h-7 w-7" />
          </div>
          <span className="tracking-tight">Inneparkert</span>
        </Link>

        {/* User authentication section */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            /* Loading state */
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <span className="animate-pulse">...</span>
            </div>
          ) : user ? (
            /* Logged-in state */
            <div className="flex items-center gap-3">
              <DropdownMenu>
                {/* User avatar and name */}
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 transition-colors
                      hover:bg-black/10"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatar_url || undefined}
                        alt={user.name || "User"}
                      />
                      <AvatarFallback className="text-sm font-medium text-gray-800">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium md:inline-block">
                      {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </div>
                </DropdownMenuTrigger>
                {/* Dropdown menu content */}
                <DropdownMenuContent align="end" className="w-56">
                  {/* User info */}
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Notification toggle */}
                  <DropdownMenuItem asChild>
                    <NotificationToggle
                      user={user}
                      className="flex w-full cursor-pointer justify-start"
                    />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Profile link */}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Sign out button */}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex cursor-pointer items-center gap-2 text-red-600 focus:bg-red-50
                      focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Logged-out state */
            <Link href="/auth">
              <Button
                className={cn(
                  "font-medium transition-colors",
                  isScrolled
                    ? "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                    : "border-white text-neutral-900 hover:bg-white hover:text-neutral-900"
                )}
                variant="outline"
                size="sm"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
