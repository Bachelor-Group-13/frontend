"use client";

import { getCurrentUser } from "@/utils/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: any;
  setUser: (user: any) => void;
}>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser?.token) {
      try {
        const payload = JSON.parse(atob(currentUser.token.split(".")[1]));
        const isExpired = Date.now() >= payload.exp * 1000;

        if (isExpired) {
          localStorage.removeItem("user");
          document.cookie =
            "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          setUser(null);
          return;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        localStorage.removeItem("user");
        document.cookie =
          "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUser(null);
        return;
      }
    }

    setUser(currentUser);

    const handleAuthChange = (event: CustomEvent) => {
      setUser(event.detail);
    };

    window.addEventListener(
      "userAuthChange",
      handleAuthChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "userAuthChange",
        handleAuthChange as EventListener
      );
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
