/**
 * Represents a user in the system with their personal and vehicle information.
 * @property {string} id - The unique identifier for the user
 * @property {string} email - The user's email address
 * @property {string} name - The user's full name
 * @property {string} [phone_number] - The user's phone number
 * @property {string} [license_plate] - The user's primary license plate
 * @property {string} [second_license_plate] - The user's secondary license plate
 * @property {string} role - The user's role in the system
 * @property {Object} [current_reservation] - The user's active parking reservation
 */
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

/**
 * Represents the user context used throughout the application.
 * @property {string} id - The unique identifier for the user
 * @property {string} email - The user's email address
 * @property {string} name - The user's full name
 * @property {string} licensePlate - The user's primary license plate
 * @property {string} secondLicensePlate - The user's secondary license plate
 * @property {string} phoneNumber - The user's phone number
 * @property {string} [avatar_url] - URL to the user's avatar image
 * @property {"ROLE_USER" | "ROLE_DEVELOPER"} role - The user's role in the system
 */
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

/**
 * Represents the authentication context used throughout the application.
 * @property {boolean} isAuthenticated - Whether the user is currently authenticated
 * @property {boolean} isLoading - Whether the authentication state is being loaded
 * @property {UserContext|null} user - The current user's information
 * @property {Function} setUser - Function to update the user information
 */
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserContext | null;
  setUser: (user: UserContext | null) => void;
}

/**
 * Represents a parking spot in the garage with its current status and occupant information.
 * @property {number} id - The unique identifier for the parking spot
 * @property {string} spotNumber - The parking spot number
 * @property {boolean} isOccupied - Whether the spot is currently occupied
 * @property {boolean} [anonymous] - Whether the spot is occupied anonymously
 * @property {boolean} [blockedSpot] - Whether the spot is blocked by another vehicle
 * @property {Object} [occupiedBy] - Information about the vehicle occupying the spot
 * @property {Vehicle|null} [vehicle] - The vehicle currently in the spot
 * @property {Object} [detectedVehicle] - Information about the detected vehicle
 */
export type ParkingSpot = {
  id: number;
  spotNumber: string;
  isOccupied: boolean;
  anonymous?: boolean;
  blockedSpot?: boolean;
  occupiedBy: {
    anonymous?: boolean;
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

/**
 * Represents the boundary of a parking spot in the garage.
 * @property {number} id - The unique identifier for the parking spot
 * @property {string} spotNumber - The parking spot number
 * @property {[number, number, number, number]} boundingBox - The coordinates of the spot's boundary
 * @property {boolean} [isOccupied] - Whether the spot is currently occupied
 * @property {Vehicle|null} [vehicle] - The vehicle currently in the spot
 */
export interface ParkingSpotBoundary {
  id: number;
  spotNumber: string;
  boundingBox: [number, number, number, number];
  isOccupied?: boolean;
  vehicle?: Vehicle | null;
}

/**
 * Represents a vehicle detected in the garage.
 * @property {string} type - The type of vehicle
 * @property {number} confidence - The confidence score of the detection
 * @property {[number, number, number, number]} boundingBox - The coordinates of the vehicle's boundary
 * @property {[number, number]} center - The center coordinates of the vehicle
 * @property {number} area - The area of the vehicle in pixels
 * @property {"front" | "back"} position - The position of the vehicle (front or back)
 * @property {string|null} [licensePlate] - The vehicle's license plate number
 * @property {string|null} [spotNumber] - The parking spot number where the vehicle is located
 */
export interface Vehicle {
  type: string;
  confidence: number;
  boundingBox: [number, number, number, number];
  center: [number, number];
  area: number;
  position: "front" | "back";
  licensePlate?: string | null;
  spotNumber?: string | null;
}

/**
 * Represents a detected parking spot with its current status.
 * @property {string} spotNumber - The parking spot number
 * @property {boolean} isOccupied - Whether the spot is currently occupied
 * @property {Vehicle|null} vehicle - The vehicle currently in the spot
 */
export interface DetectedSpot {
  spotNumber: string;
  isOccupied: boolean;
  vehicle: Vehicle | null;
}

/**
 * Represents a detected license plate with its text and bounding box.
 * @property {string} text - The detected license plate text
 * @property {number[]} bbox - The coordinates of the license plate's bounding box
 */
export interface PlateDto {
  text: string;
  bbox: number[];
}
