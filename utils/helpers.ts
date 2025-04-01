import { Dispatch, SetStateAction } from "react";

/*
 * isValidLicensePlate function:
 *
 * Checks if the license plate is valid.
 * The license plate must have 2 letters followed by 5 numbers.
 * Example: AB12345
 *
 */
export const isValidLicensePlate = (licensePlate: string): boolean => {
  const regex = /^[A-Z]{2}[0-9]{5}$/;
  return regex.test(licensePlate);
};

/*
 * handleLicensePlateChange function:
 *
 * Updates the license plate state with the value from the input field.
 */
export const handleLicensePlateChange = (
  e: React.ChangeEvent<HTMLInputElement>,
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
