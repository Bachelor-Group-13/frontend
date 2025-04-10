import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/`;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// export const getCurrentUser = () => {
//   if (typeof window !== "undefined") {
//     const userStr = localStorage.getItem("user");
//     if (userStr) return JSON.parse(userStr);
//   }
//   return null;
// };

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
    await api.post(`${API_URL}/logout`, {}, { withCredentials: true });

    window.dispatchEvent(new CustomEvent("userAuthChange", { detail: null }));

    window.location.href = "/auth";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// export const isAuthenticated = () => {
//   return getCurrentUser() !== null;
// };

// api.interceptors.request.use(
//   (config) => {
//     // const user = getCurrentUser();
//     // if (user && user.token) {
//     //   config.headers["Authorization"] = `Bearer ${user.token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (
//       error.response?.status === 401 &&
//       error.response?.data?.message === "Expired JWT token"
//     ) {
//       const currentUser = getCurrentUser();
//       const refreshToken = currentUser?.refreshToken;

//       if (refreshToken) {
//         try {
//           const refreshResponse = await axios.post(
//             `${API_URL}refresh`,
//             refreshToken,
//             {
//               headers: {
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           const newTokens = refreshResponse.data;
//           localStorage.setItem("user", JSON.stringify(newTokens));
//           document.cookie = `user=${newTokens.token}; path=/;`;

//           error.config.headers["Authorization"] = `Bearer ${newTokens.token}`;
//           return axios(error.config);
//         } catch (refreshError) {
//           logout();
//           return Promise.reject(refreshError);
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

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
