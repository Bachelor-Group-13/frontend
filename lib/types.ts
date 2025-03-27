// Defines the type for parking spot
export type ParkingSpot = {
  id: number;
  spotNumber: string;
  isOccupied: boolean;
  occupiedBy: {
    license_plate: string | null;
    second_license_plate: string | null;
    name: string | null;
    email: string | null;
    phone_number: string | null;
    user_id: string | null;
  } | null;
};

// Defines the type for the reservation response
export type ReservationResponse = {
  spot_number: string;
  user_id: string;
  license_plate: string;
  reserved_by: {
    name: string | null;
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