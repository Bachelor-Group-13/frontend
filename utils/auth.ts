import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/`;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async (email: string, password: string) => {
  try {
    console.log("Attempting to login with", { email });
    const response = await api.post(`${API_URL}signin`, {
      email,
      password,
    });
    console.log("Login response", response.data);

    const userResponse = await api.get(`${API_URL}me`);

    window.dispatchEvent(
      new CustomEvent("userAuthChange", { detail: userResponse.data })
    );
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
  phoneNumber?: string
) => {
  try {
    const response = await api.post(`${API_URL}signup`, {
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

export const logout = async () => {
  try {
    await api.post(`${API_URL}logout`, {}, { withCredentials: true });

    window.dispatchEvent(new CustomEvent("userAuthChange", { detail: null }));

    window.location.href = "/";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Expired JWT token"
    ) {
      await logout();
    }
    return Promise.reject(error);
  }
);
