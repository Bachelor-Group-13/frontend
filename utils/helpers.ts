export const isValidLicensePlate = (licensePlate: string): boolean => {
  const regex = /^[A-Z]{2}[0-9]{5}$/;
  return regex.test(licensePlate);
};
