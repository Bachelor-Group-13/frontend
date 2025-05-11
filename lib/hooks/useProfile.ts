import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { handleLicensePlateChange } from "@/lib/utils/plate-helpers";
import { profileService } from "@/lib/services/profileService";

/**
 * A hook that manages the user's profile state and operations.
 *
 * Handles form data, UI state, and profile operations
 *
 * @returns An object containing:
 *   - formData: The current form state
 *   - uiState: The current UI state
 *   - setUiState: Function to update UI state
 *   - handleFieldChange: Function to update form fields
 *   - handlePrimaryLicensePlateChange: Function to handle primary license plate changes
 *   - handleUpdate: Function to update the user's profile
 */
export function useProfile() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    licensePlate: "",
    secondLicensePlate: "",
    name: "",
    userEmail: "",
    phoneNumber: "",
  });

  const [uiState, setUiState] = useState({
    showSuccessAlert: false,
    showErrorAlert: false,
    showPasswordMismatchAlert: false,
    errorMessage: "",
    licensePlateError: null as string | null,
    showSecondLicensePlate: false,
    isLoading: true,
    isSubmitting: false,
  });

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  /**
   * Updates a specific field in the form data.
   *
   * @param {keyof typeof formData} field - The field to update
   * @param {string} value - The new value for the field
   */
  const handleFieldChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /**
   * Handles changes to the primary license plate input.
   *
   * @param {string} value - The new license plate value
   */
  const handlePrimaryLicensePlateChange = useCallback(
    (value: string) => {
      handleFieldChange("licensePlate", value);
      handleLicensePlateChange(
        { target: { value } } as React.ChangeEvent<HTMLInputElement>,
        () => {},
        (value: string | null | ((prev: string | null) => string | null)) => {
          if (typeof value === "function") {
            setUiState((prev) => ({
              ...prev,
              licensePlateError: value(prev.licensePlateError),
            }));
          } else {
            setUiState((prev) => ({ ...prev, licensePlateError: value }));
          }
        }
      );
    },
    [handleFieldChange]
  );

  /**
   * Fetches and loads the user's profile data.
   * Redirects to auth if not logged in.
   */
  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      router.push("/auth");
      return;
    }

    try {
      const userData = await profileService.fetchUserData(user.id);
      setFormData({
        ...formData,
        licensePlate: userData.licensePlate || "",
        secondLicensePlate: userData.secondLicensePlate || "",
        phoneNumber: userData.phoneNumber || "",
        userEmail: userData.email || "",
        name: userData.name || "",
      });

      if (userData.secondLicensePlate) {
        setUiState((prev) => ({ ...prev, showSecondLicensePlate: true }));
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      setUiState((prev) => ({
        ...prev,
        errorMessage:
          error.response?.data?.message || "Failed to fetch user data",
        showErrorAlert: true,
      }));
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user, isAuthenticated, router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  /**
   * Updates the user's profile with the current form data.
   * Validates all inputs before submission and handles the API call.
   */
  const handleUpdate = async () => {
    setUiState((prev) => ({ ...prev, isSubmitting: true, errorMessage: "" }));

    try {
      if (formData.password && formData.password !== formData.confirmPassword) {
        setUiState((prev) => ({ ...prev, showPasswordMismatchAlert: true }));
        return;
      }

      if (!user?.id) {
        throw new Error("User ID not found");
      }

      if (!formData.licensePlate) {
        setUiState((prev) => ({
          ...prev,
          licensePlateError: "Primary license plate is required.",
        }));
        return;
      }

      if (
        formData.phoneNumber &&
        (formData.phoneNumber.length !== 8 ||
          !/^\d+$/.test(formData.phoneNumber))
      ) {
        setUiState((prev) => ({
          ...prev,
          errorMessage: "Invalid phone number format. It should be 8 digits.",
          showErrorAlert: true,
        }));
        return;
      }

      if (formData.password && formData.password.length < 6) {
        setUiState((prev) => ({
          ...prev,
          errorMessage: "New password must be at least 6 characters long.",
          showErrorAlert: true,
        }));
        return;
      }

      const updateData = {
        licensePlate: formData.licensePlate.toUpperCase(),
        secondLicensePlate: formData.secondLicensePlate
          ? formData.secondLicensePlate.toUpperCase()
          : null,
        phoneNumber: formData.phoneNumber || null,
        password: formData.password || undefined,
      };

      await profileService.updateProfile(user.id, updateData);

      setUiState((prev) => ({ ...prev, showSuccessAlert: true }));
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      setUiState((prev) => ({
        ...prev,
        errorMessage:
          error.response?.data?.message ||
          "An unknown error occurred during update.",
        showErrorAlert: true,
      }));
    } finally {
      setUiState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    formData,
    uiState,
    setUiState,
    handleFieldChange,
    handlePrimaryLicensePlateChange,
    handleUpdate,
  };
}
