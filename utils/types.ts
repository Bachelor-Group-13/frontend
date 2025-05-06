// Defines the type for the user
export type User = {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  license_plate?: string;
  second_license_plate?: string;
  role: string;
  current_reservation?: {
    spotNumber: string;
    licensePlate: string;
  } | null;
};

// Defines the type for the user context
export interface UserContext {
  id: string;
  email: string;
  name: string;
  licensePlate: string;
  secondLicensePlate: string;
  phoneNumber: string;
  avatar_url?: string;
  role: "ROLE_USER" | "ROLE_DEVELOPER";
}

// Defines the type for the auth context
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserContext | null;
  setUser: (user: UserContext | null) => void;
}

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
    estimatedDeparture: string | null;
  } | null;
  vehicle?: Vehicle | null;
  detectedVehicle?: {
    confidence: number;
    boundingBox: [number, number, number, number];
    type: string;
    area: number;
    licensePlate?: string | null;
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
  name: string;
  plate: string;
  email?: string;
  phone_number?: string;
};

// Interface for parking spot boundary
export interface ParkingSpotBoundary {
  id: number;
  spotNumber: string;
  boundingBox: [number, number, number, number];
  isOccupied?: boolean;
  vehicle?: Vehicle | null;
}

export interface Vehicle {
  type: string;
  confidence: number;
  boundingBox: [number, number, number, number];
  center: [number, number];
  area: number;
  position: "front" | "back";
  licensePlate?: string | null;
}

export interface DetectedSpot {
  spotNumber: string;
  isOccupied: boolean;
  vehicle: Vehicle | null;
}

export interface PlateDto {
  text: string;
  bbox: number[];
}
