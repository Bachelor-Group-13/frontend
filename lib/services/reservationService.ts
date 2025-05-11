import { api } from "@/lib/api/auth";

/**
 * Creates a new parking spot reservation.
 *
 * @param {string} spotNumber - The parking spot number
 * @param {number} userId - The ID of the user making the reservation
 * @param {string} licensePlate - The license plate of the vehicle
 * @param {Date|null} estimatedDeparture - The estimated departure time
 * @returns The created reservation
 */
export async function createReservation(
  spotNumber: string,
  userId: number,
  licensePlate: string,
  estimatedDeparture: Date | null
) {
  const reservationData = {
    spotNumber,
    userId,
    licensePlate,
    reservationDate: new Date().toISOString().split("T")[0],
    estimatedDeparture: estimatedDeparture?.toISOString() ?? null,
  };

  return api.post("/api/reservations", reservationData);
}

/**
 * Deletes an existing parking spot reservation.
 *
 * @param {string} spotNumber - The parking spot number
 * @param {number} userId - The ID of the user who made the reservation
 * @returns The deleted reservation
 * @throws {Error} If the reservation is not found
 */
export async function deleteReservation(spotNumber: string, userId: number) {
  const today = new Date().toISOString().split("T")[0];
  const reservationsResponse = await api.get(`/api/reservations/date/${today}`);
  const reservations = reservationsResponse.data;

  const reservation = reservations.find(
    (res: { spotNumber: string; userId: number }) =>
      res.spotNumber === spotNumber && res.userId === userId
  );

  if (reservation) {
    return api.delete(`/api/reservations/${reservation.id}`);
  }
  throw new Error("Reservation not found");
}
