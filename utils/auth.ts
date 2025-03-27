import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const user = getCurrentUser();
});
