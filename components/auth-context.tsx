"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/utils/auth";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  licensePlate: string;
  secondLicensePlate: string;
  phoneNumber: string;
  avatar_url?: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error: any) {
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

export const useAuth = () => {
  return useContext(AuthContext);
};
