"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api/auth";
import { useRouter, usePathname } from "next/navigation";
import { AuthContextType, UserContext } from "@/lib/utils/types";

/**
 * Authentication context for managing user authentication state.
 * Provides authentication status, user data, and loading state.
 */
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  setUser: () => {},
});

/**
 * Provider component that wraps the application and provides authentication context.
 *
 * Manages authentication state, checks user session on mount and route changes,
 * and redirects to auth page when needed.
 * @param {ReactNode} props.children - Child components to be wrapped
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserContext | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount and route changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fetch current user data
        const response = await api.get("/api/auth/me");
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error: any) {
        // Handle authentication error
        setIsAuthenticated(false);
        setUser(null);
        if (pathname !== "/auth" && pathname !== "/") {
          router.push("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Context value object
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the authentication context.
 *
 * Provides access to authentication state, user data, and loading state.
 * @returns {AuthContextType} The authentication context value
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
