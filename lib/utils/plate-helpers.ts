import { ChangeEvent, Dispatch, SetStateAction } from "react";

/**
 * Checks if a license plate follows the required format.
 * The license plate must have 2 letters followed by 5 numbers.
 * Example: AB12345
 *
 * @param {string} licensePlate - The license plate to validate
 * @returns {boolean} True if the license plate is valid
 */
export const isValidLicensePlate = (licensePlate: string): boolean => {
  const regex = /^[A-Z]{2}[0-9]{5}$/;
  return regex.test(licensePlate);
};

/**
 * Updates the license plate state and validates the input.
 *
 * @param {ChangeEvent<HTMLInputElement>} e - The input change event
 * @param {Dispatch<SetStateAction<string>>} setLicensePlate - Function to update license plate state
 * @param {Dispatch<SetStateAction<string|null>>} setLicensePlateError - Function to update error state
 */
export const handleLicensePlateChange = (
  e: ChangeEvent<HTMLInputElement>,
  setLicensePlate: Dispatch<SetStateAction<string>>,
  setLicensePlateError: Dispatch<SetStateAction<string | null>>
) => {
  const value = e.target.value.toUpperCase();
  setLicensePlate(value);

  if (!isValidLicensePlate(value) && value.length === 7) {
    setLicensePlateError("Invalid license plate format. Example: AB12345");
  } else {
    setLicensePlateError(null);
  }
};
