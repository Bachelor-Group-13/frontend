import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
  }
  return null;
};

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}signin`, { email, password });
    if (response.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data));
      document.cookie = `user=${response.data.token}; path=/;`;

      window.dispatchEvent(
        new CustomEvent("userAuthChange", { detail: response.data }),
      );
    }
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.response?.data?.message || "Login failed",
    };
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
  licensePlate?: string,
  phoneNumber?: string,
) => {
  try {
    const response = await axios.post(`${API_URL}signup`, {
      name,
      email,
      password,
      licensePlate,
      phoneNumber,
    });
    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.response?.data?.message || "Failed to sign up",
    };
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  window.dispatchEvent(new CustomEvent("userAuthChange", { detail: null }));
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

api.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    if (user && user.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
