// Defines the type for parking spot
export type ParkingSpot = {
  id: number;
  spotNumber: string;
  isOccupied: boolean;
  occupiedBy: {
    license_plate: string | null;
    email: string | null;
    phone_number: string | null;
    user_id: string | null;
  } | null;
};

// Defines the type for the reservation response
export type ReservationResponse = {
  spot_number: string;
  user_id: string;
  reserved_by: {
    license_plate: string | null;
    email: string | null;
    phone_number: string | null;
  };
};

// Defines the type for storing plate + user info
export type PlateUserInfo = {
  plate: string;
  email?: string;
  phone_number?: string;
};