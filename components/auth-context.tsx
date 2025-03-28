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
