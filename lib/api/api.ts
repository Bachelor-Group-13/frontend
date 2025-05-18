import { api } from "./auth";

// /**
//  * Fetches user information by their ID.
//  * @param id - The user's ID
//  * @returns Promise with user data
//  */
// export const getUserById = (id: number) => api.get(`/api/auth/${id}`);
//
// /**
//  * Retrieves all reservations for a specific date.
//  * @param date - The date to fetch reservations for
//  * @returns Promise with reservation data
//  */
// export const getReservationsByDate = (date: string) =>
//   api.get(`/api/reservations/date/${date}`);
//
// /**
//  * Creates a new parking reservation.
//  * @param data - The reservation data to create
//  * @returns Promise with created reservation
//  */
// export const createReservation = (data: any) =>
//   api.post(`/api/reservations`, data);
//
// /**
//  * Deletes a parking reservation by its ID.
//  * @param id - The ID of the reservation to delete
//  * @returns Promise with deletion result
//  */
// export const deleteReservation = (id: number) =>
//   api.delete(`/api/reservations/${id}`);
//
// /**
//  * Retrieves information about a license plate.
//  * @param plate - The license plate number to look up
//  * @returns Promise with license plate information
//  */
// export const getLicensePlateInfo = (plate: string) =>
//   api.get(`/api/auth/license-plate/${plate}`);
//
/**
 * Uploads an image for license plate recognition.
 * @param formData - FormData containing the image file
 * @returns Promise with recognition results
 */
export const uploadLicensePlateImage = (formData: FormData) =>
  api.post("/license-plate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
