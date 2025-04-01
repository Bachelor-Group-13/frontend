import { api } from "@/utils/auth";

export const getUserById = (id: number) => api.get(`/api/auth/${id}`);

export const getReservationsByDate = (date: string) =>
  api.get(`/api/reservations/date/${date}`);

export const createReservation = (data: any) =>
  api.post(`/api/reservations`, data);

export const deleteReservation = (id: number) =>
  api.delete(`/api/reservations/${id}`);

export const getLicensePlateInfo = (plate: string) =>
  api.get(`/api/auth/license-plate/${plate}`);

export const uploadLicensePlateImage = (formData: FormData) =>
  api.post("/license-plate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
