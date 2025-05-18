import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/`;

/**
 * Axios instance configured for API requests.
 * Includes base URL, credentials, and default headers.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Authenticates a user with email and password.
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with user data or error
 */
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post(`${API_URL}signin`, {
      email,
      password,
    });
    try {
      const userResponse = await api.get(`${API_URL}me`);
      window.dispatchEvent(
        new CustomEvent("userAuthChange", { detail: userResponse.data })
      );
    } catch (meError: unknown) {
      console.error("Error fetching user details:", meError);
      window.dispatchEvent(
        new CustomEvent("userAuthChange", { detail: response.data })
      );
    }

    return { data: response.data, error: null };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    console.error("Login error:", axiosError.response?.data || error);
    return {
      data: null,
      error: axiosError.response?.data?.message || "Login failed",
    };
  }
};

/**
 * Registers a new user account.
 * @param name - User's full name
 * @param email - User's email address
 * @param password - User's password
 * @param licensePlate - Optional primary license plate
 * @param phoneNumber - Optional phone number
 * @returns Promise with registration data or error
 */
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
  } catch (error) {
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return {
      data: null,
      error: err.response?.data?.message || err.message || "Failed to sign up",
    };
  }
};

// Logs out the current user and redirects to the home page.
export const logout = async () => {
  try {
    await api.post(`${API_URL}logout`, {}, { withCredentials: true });

    window.dispatchEvent(new CustomEvent("userAuthChange", { detail: null }));

    window.location.href = "/";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Automatically logs out the user if their token has expired.
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
